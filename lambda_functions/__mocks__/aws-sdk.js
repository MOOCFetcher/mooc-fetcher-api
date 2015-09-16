var snsPublish = jest.genMockFn().mockImplementation(function(data, callback) {
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
  }
}

module.exports = AWS
