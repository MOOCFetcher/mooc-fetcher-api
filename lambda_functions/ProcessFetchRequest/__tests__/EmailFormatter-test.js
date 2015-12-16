jest.autoMockOff()

let format = require('../EmailFormatter').format

describe('EmailFormatter', () => {
  let input

  beforeEach(() => {
    input = require('../fixtures/dropbox.json')
  })

  it('returns a subject and text of email with the given inputs', () => {
    let {subject, emailText} = format(input)

    expect(subject).toBeDefined()
    expect(subject.includes('Your download request')).toBe(true)
    expect(emailText).toBeDefined()
    expect(emailText.includes('Your request to download')).toBe(true)
  })

  it('substitutes a readable value for the delivery method field', () => {
    let {emailText} = format(input)

    expect(emailText.includes('Delivery Method: Dropbox')).toBe(true)

    input = require('../fixtures/usb-drive.json')

    ;({emailText} = format(input))

    expect(emailText.includes('Delivery Method: USB Drive')).toBe(true)
  })

  it('substitutes a readable value for media type field', () => {
    let {emailText} = format(input)

    expect(emailText.includes('Video, Audio')).toBe(true)
  })
})
