var sesSendEmail = jest.genMockFn().mockImplementation(function(data, callback) {
  callback(null, {})
}),
dynamodbDocPut = jest.genMockFn().mockImplementation(function(params, callback) {
  callback(null, {})
})

var AWS = {
  config: {
    region: ''
  },
  SES: function() {
    return {
      sendEmail: sesSendEmail
    }
  },
  DynamoDB: {
    DocumentClient: function() {
      return {
        put: dynamodbDocPut
      }
    }
  }
}

module.exports = AWS
