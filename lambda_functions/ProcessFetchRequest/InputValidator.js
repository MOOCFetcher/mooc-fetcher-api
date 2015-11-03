import validate from 'validate.js'

let constraints = {
  course: {
    presence: true
  },
  deliverymethod: {
    presence: true,
    inclusion: ['dropbox', 'cd']
  },
  mediatype: {
    presence: true
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

  if (inputs.deliverymethod === 'cd') {
    c = Object.assign(c, constraints, mailingAddressConstraints)
  } else {
    c = constraints
  }
  return validate(inputs, c)
}
