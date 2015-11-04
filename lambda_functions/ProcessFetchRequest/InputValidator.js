import validate from 'validate.js'

validate.validators.array = function(value, options) {
  if (validate.isArray(value) && options) {
    return null
  }
  return 'should be an array'
}

let constraints = {
  course: {
    presence: true
  },
  deliverymethod: {
    presence: true,
    inclusion: ['dropbox', 'usb-drive']
  },
  mediatype: {
    presence: true,
    array: true
  },
  name: {
    presence: true
  },
  email: {
    presence: true,
    email: true
  },
  phone: {
    presence: true,
    format: {
      pattern: '^\\\+?[0-9\-]+'
    }
  }
}

let dropboxConstraints = {
  token: {
    presence: true
  }
}

let mailingAddressConstraints = {
  mailingAddress: {
    presence: true
  },
  city: {
    presence: true
  },
  country: {
    presence: true
  },
  postalCode: {
    presence: true
  }
}

// Validates inputs received by lambda function
exports.validate = function(inputs) {
  let c = {}

  if (inputs.deliverymethod === 'usb-drive') {
    c = Object.assign(c, constraints, mailingAddressConstraints)
  } else {
    c = Object.assign(c, constraints, dropboxConstraints)
  }
  return validate(inputs, c)
}
