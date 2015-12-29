import AWS from 'aws-sdk'

AWS.config.region = 'us-east-1'

let dynamodb = new AWS.DynamoDB()

dynamodb.createTable({
  TableName: 'FetchRequests',
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'timestamp',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'timestamp',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
}, (err, data) => {
  if (err) {
    console.log(err, err.stack)
    return
  }
  console.log(data)
})


