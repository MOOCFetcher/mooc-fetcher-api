jest.dontMock('../InputValidator.js')

let validate = require('../InputValidator.js').validate

describe('InputValidator', function() {
  it('fails if Course ID is not provided', () => {
    let res = validate({})

    expect(res.course).not.toBeNull()
  })

  it('fails if Delivery Method is not provided')

  it('fails if Media Type is blank or not an array')

  it('fails if Name is not provided')

  it('fails if Email is not provided')

  it('fails if auth token is not provided')
})

