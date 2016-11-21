import index from './index'
import util from 'util'


let event = null

if (process.argv[process.argv.length - 1] === 'mock') {
  event = {isMock: true}
} else {
  event = {}
}

const context = {
  fail (error) {
    console.log('Failed:', error)
    process.exit(1)
  },
  succeed (result) {
    console.log('Succeeded:', util.inspect(result, {depth: 5}))
    process.exit()
  }
}

index.handler(event, context)
