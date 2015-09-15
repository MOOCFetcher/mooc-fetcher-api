var AWS = require('aws-sdk')

AWS.config.region = 'us-east-1'

exports.handler = function(event, context) {
  var req = event.Records[0]
  var sns = new AWS.SNS()

  console.log('Recieved Input:\n', req)
  sns.publish({
    TopicArn: 'arn:aws:sns:us-east-1:720053052670:mooc-fetcher-requests',
    Message: '{}'
  }, function(err, data) {
    if (err) {
      context.fail(err)
      return
    }
    context.succeed(data)
  })
}
