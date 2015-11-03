jest.dontMock('../index.js')
describe('ProcessFetchRequest', function() {
  var handler = require('../index.js').handler

  it('publishes a message to SNS if all inputs are valid', function() {
    handler({}, {succeed: jest.genMockFn(), fail: jest.genMockFn()})
  })
})
