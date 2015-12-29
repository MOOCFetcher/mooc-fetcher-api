import AWS from 'aws-sdk'
import InputValidator from './InputValidator'
import EmailFormatter from './EmailFormatter'
import crypto from 'crypto'

AWS.config.region = 'us-east-1'

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = crypto.randomBytes(1)[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)

    return v.toString(16);
  })
}

exports.handler = function(event, context) {
  // Validate Inputs
  let errors = InputValidator.validate(event)

  if (errors) {
    console.log(errors)
    context.fail('Validation failed. Invalid data.')
    return
  }

  // Add id and timestamp
  event.timestamp = (new Date()).toISOString()
  event.id = uuid()

  // Add to DynamoDB table
  let dynamodbDoc = new AWS.DynamoDB.DocumentClient()
  let params = {
    TableName: 'FetchRequests',
    Item: event
  }

  dynamodbDoc.put(params, (err) => {
    if (err) {
      context.fail(err)
      return
    }
    // Send Email
    let {emailText, subject} = EmailFormatter.format(event),
      ses = new AWS.SES()

      ses.sendEmail({
        Source: 'MOOC Fetcher Support <contact@moocfetcher.com>',
        Destination: {
          ToAddresses: [event.email]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: emailText,
              Charset: 'UTF-8'
            }
          }
        }
      }, function(err1) {
        if (err1) {
          console.log('Error sending email', err1)
        }
        context.succeed()
      })
  })
}

