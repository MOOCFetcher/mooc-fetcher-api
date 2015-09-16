jest.dontMock('../index.js')
describe('ProcessFetchRequest', function() {
  var handler = require('../index.js').handler

  it('publishes a message to SNS if all inputs are valid', function() {
    handler({}, {succeed: jest.genMockFn(), fail: jest.genMockFn()})
  })

  it('fails if Course ID is not provided')

  it('fails if Delivery Method is not provided')

  it('fails if Media Type is blank or not an array')

  it('fails if Name is not provided')

  it('fails if Email is not provided')

  it('fails if auth token is not provided')
})
