var snsPublish = jest.genMockFn().mockImplementation(function(data, callback) {
  callback(null, {})
}),
sesSendEmail = jest.genMockFn().mockImplementation(function(data, callback) {
  callback(null, {})
})


var AWS = {
  config: {
    region: ''
  },
  SNS: function() {
    return {
      publish: snsPublish
    }
  },
  SES: function() {
    return {
      sendEmail: sesSendEmail
    }
  }
}

module.exports = AWS
