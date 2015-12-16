jest.autoMockOff()

let validInputs = {
  course: 'modern-postmodern-1',
  deliverymethod: 'dropbox',
  mediatype: ['video'],
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  phone: '+9196591251',
  token: 'abcxyz123'
}

describe('ProcessFetchRequest', function() {
  var handler = require('../index.js').handler,
    succeed,
    fail

  beforeEach(function() {
    succeed = jest.genMockFn()
    fail = jest.genMockFn()
  })

  it('fails if inputs are invalid', function() {
    handler({}, {succeed, fail})
    expect(fail.mock.calls.length).toBe(1)
    expect(succeed.mock.calls.length).toBe(0)
  })

  it('succeeds if inputs are valid', function() {
    handler(validInputs, {succeed, fail})
    expect(fail.mock.calls.length).toBe(0)
    expect(succeed.mock.calls.length).toBe(1)
  })
})
