import AWS from 'aws-sdk'
import InputValidator from './InputValidator'
import EmailFormatter from './EmailFormatter'

AWS.config.region = 'us-east-1'

exports.handler = function(event, context) {
  // Validate Inputs
  let errors = InputValidator.validate(event)

  if (errors) {
    console.log(errors)
    context.fail('Validation failed. Invalid data.')
    return
  }

  // TODO Add task to SQS and invoke ECS container

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
  }, function(err) {
    if (err) {
      context.fail(err)
      return
    }
    context.succeed()
  })
}
