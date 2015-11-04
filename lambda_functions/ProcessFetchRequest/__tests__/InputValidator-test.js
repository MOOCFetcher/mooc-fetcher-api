jest.dontMock('../InputValidator.js')
let validate = require('../InputValidator.js').validate
let omit = require('lodash/object/omit')

let validInputs = {
  course: 'modern-postmodern-1',
  deliverymethod: 'dropbox',
  mediatype: ['video'],
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  phone: '+9196591251',
  token: 'abcxyz123'
}

let validMailingAddressInputs = {
  mailingAddress: '242 Holland Drive',
  city: 'Berlin',
  country: 'Germany',
  postalCode: '12345'
}

describe('InputValidator', function() {
  it('fails if Course ID is not provided', () => {
    let res = validate(omit(validInputs, 'course'))

    expect(res.course).toBeDefined()
  })

  it('fails if Delivery Method is not provided, or is an invalid value', () => {
    let inputs = omit(validInputs, 'deliverymethod')
    let res = validate(inputs)

    expect(res.deliverymethod).toBeDefined()

    inputs.deliverymethod = 'gibberish'
    res = validate(inputs)
    expect(res.deliverymethod).toBeDefined()
  })

  it('fails if Media Type is blank or not an array', () => {
    let inputs = omit(validInputs, 'mediatype')
    let res = validate(inputs)

    expect(res.mediatype).toBeDefined()

    inputs.mediatype = 'gibberish'
    res = validate(inputs)
    expect(res.mediatype).toBeDefined()
  })

  it('fails if Name is not provided', () => {
    let res = validate(omit(validInputs, 'name'))

     expect(res.name).toBeDefined()
  })

  it('fails if Email is not provided', () => {
    let res = validate(omit(validInputs, 'email'))

    expect(res.email).toBeDefined()
  })

  it('fails if Dropbox auth token is not provided', () => {
    let res = validate(omit(validInputs, 'token'))

    expect(res.token).toBeDefined()
  })

  describe('when deliverymethod is usb-drive', () => {
    let inputs = {}

    beforeEach(() => {
      inputs = Object.assign({}, validInputs, validMailingAddressInputs)
      inputs.deliverymethod = 'usb-drive'
    })

    let mailingAddressFields = [
      'mailingAddress',
      'city',
      'country',
      'postalCode'
    ]

    mailingAddressFields.forEach((f) => {
      it(`fails if ${f} not provided`, () => {
        let res = validate(omit(inputs, f))

        expect(res[f]).toBeDefined()
      })
    })
  })
})

