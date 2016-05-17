import AWS from 'aws-sdk'
import async from 'async'

AWS.config.region = 'us-east-1'

let dynamodbDoc = new AWS.DynamoDB.DocumentClient()

function deleteRecord({id, timestamp}, callback) {
  let params = {
    TableName: 'FetchRequests',
    Key: {id, timestamp}
  }

  dynamodbDoc.delete(params, callback)
}

exports.handler = function(event, context) {
  let processed = {}
  let tasks = []

  event.Records.forEach(function(record) {
    // Only process MODIFY events
    if (record.eventName !== 'MODIFY') {
      return
    }
    // Only process events with status changes
    let id = record.dynamodb.Keys.id.S
    let oldStatus = record.dynamodb.OldImage.status.S
    let newStatus = record.dynamodb.NewImage.status.S

    if (oldStatus === newStatus) {
      processed[id] = true
      return
    }

    switch (newStatus) {
      case 'error': // TODO
        console.log('Sending notification for errored request %s', id)
        processed[id] = true
        break
      case 'processing': // TODO
        console.log('Processing %s', id)
        processed[id] = true
        break
      case 'done': {
        let timestamp = record.dynamodb.Keys.timestamp.S

        console.log('Deleting completed request %s', id)
        tasks.push((cb) => deleteRecord({id, timestamp}, (err) => {
          if (err) {
            console.log('Error deleting record: %s', err)
            processed[id] = false
          } else {
            processed[id] = true
          }
          cb()
        }))
        break
      }
      default:
        processed[id] = false
        console.log('Unexpected status change to \'%s\' for %s', newStatus, id)
    }
  })

  async.parallel(tasks, () => {
    console.log('Processed %d of %d records.', Object.keys(processed).length, event.Records.length)
    context.succeed(processed)
  })
}
