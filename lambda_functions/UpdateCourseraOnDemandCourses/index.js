/* Lambda function to query the Coursera API and pull the latest OnDemand
 * courses.
 *
 * This function does the following:
 *
 * - Queries the Coursera API to retrieve all On Demand courses
 *
 * - Updates a cached list of On Demand courses on S3. (CACHED_ONDEMAND_KEY)
 *
 * - Queries the Coursera API to check if any previously unlaunched On Demand
 *   courses have been launched, and adds them to the cached list of launched
 *   On Demand courses. (CACHED_ONDEMAND_LAUNCHED_KEY)
 *
 * - Sends a notification email if any new On Demand courses are added or
 *   launched
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
const CACHED_ONDEMAND_LAUNCHED_KEY = 'coursera/ondemand/launched.json'
const CACHED_ONDEMAND_KEY = 'coursera/ondemand/all.json'
const COURSERA_API_COURSES_PATH = '/api/courses.v1'
const COURSERA_API_ONDEMAND_PATH = '/api/onDemandCourses.v1?&q=slug&slug=%s'
const client = request.createClient('https://www.coursera.org')
const s3Client = new AWS.S3()
const sesClient = new AWS.SES({region: 'us-east-1'})

exports.handler = function(event, context) {
  // Test function to load courses from a JSON file.
  function loadCoursesFromFile(f) {
    return function(callback) {
      console.log('Fetching courses from file %s…', f)
      callback(null, JSON.parse(fs.readFileSync(f)).courses)
    }
  }

  function loadFromCourseraPaged(callback, next, courses) {
    let url = COURSERA_API_COURSES_PATH

    if (next) {
      url = url + '?start=' + next
    }

    client.get(url, function(err, res, body) {
      if (!err) {
        if (res.statusCode !== 200) {
          console.log('Unexpected Status Code %s', res.statusCode)
          callback(new Error(util.format('Unexpected Status Code %s', res.statusCode)))
        } else {
          let c = courses.concat(body.elements)

          if (body.paging && body.paging.next) {
            loadFromCourseraPaged(callback, body.paging.next, c)
          } else {
            callback(null, c)
          }
        }
      } else {
        console.log('Error fetching courses from Coursera: %s', err)
        callback(err)
      }
    })
  }

  // Loads all courses by querying the Coursera API.
  function loadFromCoursera(callback) {
    console.log('Fetching courses from Coursera…')
    loadFromCourseraPaged(callback, null, [])
  }

  // Loads a list of cached courses from S3, given the key.
  function loadCoursesFromS3(key) {
    return function(callback) {
      console.log('Fetching courses from S3 key: %s', key)
      s3Client.getObject({Bucket: S3_BUCKET, Key: key}, function(err, data) {
        if (!err) {
          callback(null, JSON.parse(data.Body).courses)
        } else {
          console.log('Error fetching courses from S3: %s', err)
          callback(err)
        }
      })
    }
  }

  // Adds a course to the list of launched courses, if `launchedAt` field is set.
  function updateLaunchStatus({launched}, course, callback) {
    client.get(util.format(COURSERA_API_ONDEMAND_PATH, course.slug), function(err, res, body) {
      if (!err) {
        if (res.statusCode !== 200) {
          console.log('Unexpected Status Code %s for course %s', res.statusCode, course.slug)
        } else if (body.elements[0].launchedAt) {
          console.log('Adding course: %s', course.slug)
          launched.push(course)
        }

        callback(null, {launched})
      } else {
        console.log('Error fetching info for %s: %s', course.slug, err)
        callback(err)
      }
    })
  }

  // Mock function that does nothing. (Used instead of `updateLaunchStatus`)
  function updateLaunchStatusMock(newLaunchedCourses, course, callback) {
    // console.log('Checking course: %s', course.slug)
    callback(null, newLaunchedCourses)
  }

  // Compares course IDs from Coursera with the cached copies and performs
  // updates where necessary. Also iterates through any unlaunched courses
  // and checks if they have now been launched, and adds them to the
  // launched list.
  function updateCache({courseraOnDemand, cachedOnDemand, cachedOnDemandLaunched}, callback) {
    let cIds = _.pluck(courseraOnDemand, 'id')
    let odIds = _.pluck(cachedOnDemand, 'id')

    let newOnDemand = _.map(_.without(cIds, ...odIds), (id) => _.find(courseraOnDemand, {id}))

    console.log('Found %d new courses', newOnDemand.length)

    cachedOnDemand.push(...newOnDemand)
    odIds.push(...(_.pluck(newOnDemand, 'id')))

    let lIds = _.pluck(cachedOnDemandLaunched, 'id')

    let onDemandUnlaunched = _.map(_.without(cIds, ...lIds), (id) => _.find(cachedOnDemand, {id}))

    console.log('Checking launch status for %d courses', onDemandUnlaunched.length)

    async.reduce(
      onDemandUnlaunched,
      {launched: []},
      event.isMock ? updateLaunchStatusMock : updateLaunchStatus,
      function(err, {launched}) {
        if (err) {
          console.log('Error filtering for launched courses: %s', err)
          callback(err)
          return
        }
        console.log('Found %d new launched courses', launched.length)
        cachedOnDemandLaunched.push(...launched)
        callback(null, {cachedOnDemand, cachedOnDemandLaunched, newOnDemand, newLaunched: launched})
      })
  }

  // Test function to save courses to a JSON file.
  function saveUpdatedCoursesToFile({cachedOnDemand, cachedOnDemandLaunched, newOnDemand, newLaunched}, callback) {
    console.log('Saving new data…')
    fs.writeFileSync('fixtures/all_ondemand_new.json', JSON.stringify({courses: cachedOnDemand}, 2, 2))
    fs.writeFileSync('fixtures/launched_new.json', JSON.stringify({courses: cachedOnDemandLaunched}, 2, 2))
    callback(null, {newOnDemand, newLaunched})
  }

  // Update cached lists of On Demand Courses, after making a copy of them.
  function saveUpdatedCoursesToS3({cachedOnDemand, cachedOnDemandLaunched, newOnDemand, newLaunched}, callback) {
    async.series([
      (cb) => s3Client.copyObject({Bucket: S3_BUCKET, CopySource: util.format('%s/%s', S3_BUCKET, CACHED_ONDEMAND_KEY), Key: util.format('%s-%s.json', CACHED_ONDEMAND_KEY.slice(0, -5), moment().format('DD-MM-YYYY-HHMM'))}, cb),
      (cb) => s3Client.copyObject({Bucket: S3_BUCKET, CopySource: util.format('%s/%s', S3_BUCKET, CACHED_ONDEMAND_LAUNCHED_KEY), Key: util.format('%s-%s.json', CACHED_ONDEMAND_LAUNCHED_KEY.slice(0, -5), moment().format('DD-MM-YYYY-HHMM'))}, cb),
      (cb) => s3Client.putObject({Bucket: S3_BUCKET, Key: CACHED_ONDEMAND_KEY, Body: JSON.stringify({courses: cachedOnDemand})}, cb),
      (cb) => s3Client.putObject({Bucket: S3_BUCKET, Key: CACHED_ONDEMAND_LAUNCHED_KEY, Body: JSON.stringify({courses: cachedOnDemandLaunched})}, cb)
    ], function(err, result) {
      if (err) {
        callback(err)
      } else {
        callback(null, {s3Responses: result, newOnDemand, newLaunched})
      }
    })
  }

  // Prepares a notification email to send via SES
  function prepNotificationEmail({newOnDemand, newLaunched}) {
    let newOnDemandTxt = _.map(newOnDemand, (c) => `${c.name}
http://coursera.org/learn/${c.slug}`).join('\n\n')
    let newLaunchedTxt = _.map(newLaunched, (c) => `${c.name}
http://coursera.org/learn/${c.slug}`).join('\n\n')
    let body = ['New On-Demand Courses added:\n',
      newOnDemandTxt || 'None',
      '\n',
      'New On-Demand Courses launched:\n',
      newLaunchedTxt || 'None'
    ].join('\n')

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
            Data: 'Coursera Update',
            Charset: 'utf-8'
          }
        },
        Source: 'MOOCFetcher <contact@moocfetcher.com>'
      }
  }

  // Send a notification email containing newly added and launched courses
  function sendNotificationEmail({newOnDemand, newLaunched}, cb) {
    if ((newOnDemand.length === 0) && (newLaunched.length === 0)) {
      cb()
      return
    }

    let params = prepNotificationEmail({newOnDemand, newLaunched})

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
  function processCourses(err, [courseraAll, cachedOnDemand, cachedOnDemandLaunched]) {
    console.log('Found %d courses in all…', courseraAll.length)
    let courseraOnDemand = _.filter(courseraAll, (c) => c.courseType === 'v2.ondemand')

    if (err) {
      console.log('Failed due to error: %s', err)
      context.fail(err)
    } else {
      async.waterfall([
        async.apply(updateCache, {courseraOnDemand, cachedOnDemand, cachedOnDemandLaunched}),
        event.isMock ? saveUpdatedCoursesToFile : saveUpdatedCoursesToS3
      ], updateContext)
    }
  }

  // Load courses from S3 and Coursera (or test fixtures, if isMock is set)
  async.parallel(
    event.isMock ? [
      loadCoursesFromFile('fixtures/all.json'),
      loadCoursesFromFile('fixtures/all_ondemand.json'),
      loadCoursesFromFile('fixtures/launched.json')
    ] : [
      loadFromCoursera,
      loadCoursesFromS3(CACHED_ONDEMAND_KEY),
      loadCoursesFromS3(CACHED_ONDEMAND_LAUNCHED_KEY)
    ],
    processCourses)
}
