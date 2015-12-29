import Mustache from 'mustache'
let capitalize = require('lodash/string/capitalize')

let template = `Dear {{name}},

Your request to download course materials for course {{{coursename}}} has been received and currently being processed. You will receive another email when your request has been processed.

Unique Request ID: {{id}}

Course Name: {{{coursename}}}

Delivery Method: {{getDeliveryMethod}}

Media Types: {{getMediaTypes}}

Name: {{name}}

Email: {{email}}

Phone: {{phone}}

{{#mailingAddress}}
Mailing Address:
{{{mailingAddress}}}
{{city}}
{{#state}}{{state}}{{/state}}
{{country}}
{{postalCode}}

{{/mailingAddress}}
Please check the above details, and send us an email if there are errors or ommisions.

Regards

MOOC Fetcher Support
`

let renderers = {
  getDeliveryMethod() {
    let mapping = {
      dropbox: 'Dropbox',
      'usb-drive': 'USB Drive',
      gdrive: 'Google Drive'
    }

    return mapping[this.deliverymethod]
  },
  getMediaTypes() {
    return (this.mediatype.map((m) => capitalize(m))).join(', ')
  }
}

exports.format = function(inputs) {
  let templateInputs = Object.assign({}, inputs, renderers),
    subject = `Your download request for ${inputs.coursename} has been received`

  let emailText = Mustache.render(template, templateInputs)

  return {subject, emailText}
}
