import index from './index'
import util from 'util'

var context, event

if (process.argv[process.argv.length - 1] === 'mock') {
  event = {isMock: true}
} else {
  event = {}
}

context = {
  fail: function(error) {
    console.log('Failed:', error)
    process.exit(1)
  },
  succeed: function(result) {
    console.log('Succeeded:', util.inspect(result, {depth: 5}))
    process.exit()
  }
}
index.handler(event, context)
