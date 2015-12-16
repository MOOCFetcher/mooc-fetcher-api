var util = require('util')
var fixtureFile = process.argv[process.argv.length - 1]
var lambda = require('./index.js').handler

lambda(require(`./${fixtureFile}`), {
  fail: function(error) {
    console.log('Failed:', error)
    process.exit(1)
  },
  succeed: function(result) {
    console.log('Succeeded:', util.inspect(result, {depth: 5}))
    process.exit()
  }
})
