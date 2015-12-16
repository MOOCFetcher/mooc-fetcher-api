import AWS from 'aws-sdk'
import InputValidator from './InputValidator'

AWS.config.region = 'us-east-1'

exports.handler = function(event, context) {
  var errors = InputValidator.validate(event)

  if (errors) {
    context.fail(errors)
    return
  }

  context.succeed({success: true})
}
