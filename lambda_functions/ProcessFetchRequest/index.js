var AWS = require('aws-sdk')

AWS.config.region = 'us-east-1'

exports.handler = function(event, context) {
  console.log('CONTEXT:\n', context)
  console.log('EVENT:\n', event)

  var sns = new AWS.SNS()

  sns.publish({
    TopicArn: 'arn:aws:sns:us-east-1:720053052670:mooc-fetcher-requests',
    Message: '{}'
  }, function(err) {
    if (err) {
      context.fail(err)
      return
    }
    context.succeed({success: true})
  })
}
