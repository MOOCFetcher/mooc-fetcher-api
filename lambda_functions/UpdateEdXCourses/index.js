/* Lambda function to query the EdX Search API and pull the latest
 * courses.
 *
 * This function does the following:
 *
 * - Queries the EdX Search API to retrieve all courses.
 *
 * - Updates a cached list of courses in S3.
 *
 * - Sends a notification email.
 *
 * TESTING
 * -------
 * Check the file test-end-to-end.js.
 *
 * We set a special boolean property `isMock` inside the event object passed
 * into the handler, which triggers offline behavior at certain places.
 */

import AWS from 'aws-sdk'
import request from 'request-json'
import _ from 'lodash'
import async from 'async'
import fs from 'fs'
import util from 'util'
import moment from 'moment'

const S3_BUCKET = 'moocfetcher'
const CACHED_COURSE_INFO_KEY = 'edx/all.json'
const EDX_SEARCH_PATH = '/search/api/all'
const client = request.createClient('https://www.edx.org')
const s3Client = new AWS.S3()
const sesClient = new AWS.SES({region: 'us-east-1'})

exports.handler = function(event, context) {
  // Test function to load courses from a JSON file.
  function loadCoursesFromFile(f) {
    return function(callback) {
      console.log('Fetching courses from file %s…', f)
      callback(null, JSON.parse(fs.readFileSync(f)))
    }
  }

   // Loads a list of cached courses from S3, given the key.
  function loadCoursesFromS3(key) {
    return function(callback) {
      console.log('Fetching courses from S3 key: %s', key)
      s3Client.getObject({Bucket: S3_BUCKET, Key: key}, function(err, data) {
        if (!err) {
          callback(null, JSON.parse(data.Body))
        } else {
          console.log('Error fetching courses from S3: %s', err)
          callback(err)
        }
      })
    }
  }

  // Loads all the courses from EdX, using the search API.
  function loadFromEdX(callback) {
    client.get(EDX_SEARCH_PATH, function(err, res, body) {
      if (!err) {
        if (res.statusCode !== 200) {
          console.log('Unexpected Status Code %s', res.statusCode)
          callback(new Error(util.format('Unexpected Status Code %s', res.statusCode)))
        } else {
          callback(null, body)
        }
      } else {
        console.log('Error fetching courses from EdX', err)
        callback(err)
      }
    })
  }

  // Compares the current list of courses with the new list
  // and updates the current list.
  function updateCache({new_, current}, callback) {
    let nIds = _.pluck(new_, 'guid')
    let cIds = _.pluck(current, 'guid')
    let added = _.map(_.without(nIds, ...cIds), (guid) => _.find(new_, {guid}))

    console.log('Found %d new courses', added.length)
    callback(null, {added, updated: new_})
  }

  // Test function to save courses to a JSON file.
  function saveUpdatedCoursesToFile({updated, added}, callback) {
    console.log('Saving new data…')
    fs.writeFileSync('fixtures/updated.json', JSON.stringify(updated, 2, 2))
    callback(null, {added})
  }


  // Update the list of EdX courses in S3
  function saveUpdatedCoursesToS3({updated, added}, callback) {
    async.series([
      (cb) => s3Client.copyObject({Bucket: S3_BUCKET, CopySource: util.format('%s/%s', S3_BUCKET, CACHED_COURSE_INFO_KEY), Key: util.format('%s-%s.json', CACHED_COURSE_INFO_KEY.slice(0, -5), moment().format('DD-MM-YYYY-HHMM'))}, cb),
      (cb) => s3Client.putObject({Bucket: S3_BUCKET, Key: CACHED_COURSE_INFO_KEY, Body: JSON.stringify(updated)}, cb)
    ], function(err, result) {
      if (err) {
        callback(err)
      } else {
        callback(null, {s3Responses: result, added})
      }
    })
  }

 // Prepares a notification email to send via SES
  function prepNotificationEmail({added}) {
    let addedTxt = _.map(added, (c) => `${c.l}
${c.url}`).join('\n\n')

    let body = [util.format('%d courses added:\n', added.length),
      addedTxt || 'None',
      '\n'].join('\n')

    return {
        Destination: {
          ToAddresses: ['d@moocfetcher.com']
        },
        Message: {
          Body: {
            Text: {
              Data: body,
              Charset: 'utf-8'
            }
          },
          Subject: {
            Data: 'EdX Update',
            Charset: 'utf-8'
          }
        },
        Source: 'MOOCFetcher <contact@moocfetcher.com>'
      }
  }


  // Send a notification email containing newly added and launched courses
  function sendNotificationEmail({updated, added}, cb) {
    if (added.length === 0) {
      cb()
      return
    }

    let params = prepNotificationEmail({added})

    if (event.isMock) {
      console.log('Email:\n%s', params.Message.Body.Text.Data)
      cb()
    } else {
      sesClient.sendEmail(params, (err) => {
        if (err) {
          console.log(`Error sending e-mail: ${err}`, err.stack)
        }
        cb()
      })
    }
  }


  // Updates AWS Lambda context after checking the final results.
  function updateContext(err, result) {
    if (err) {
      context.fail(err)
    } else {
      sendNotificationEmail(result, () => {
        context.succeed(result)
      })
    }
  }

  // Collect the current course lists and trigger update processing.
  function processCourses(err, [new_, current]) {
    if (err) {
      console.log('Failed due to error: %s', err)
      context.fail(err)
    } else {
      async.waterfall([
        async.apply(updateCache, {new_, current}),
        event.isMock ? saveUpdatedCoursesToFile : saveUpdatedCoursesToS3
      ], updateContext)
    }
  }

  // Load courses from S3 and EdX (or test fixtures, if isMock is set)
  async.parallel(
    event.isMock ? [
      loadCoursesFromFile('fixtures/new.json'),
      loadCoursesFromFile('fixtures/all.json')
    ] : [
      loadFromEdX,
      loadCoursesFromS3(CACHED_COURSE_INFO_KEY)
    ],
    processCourses)
}
