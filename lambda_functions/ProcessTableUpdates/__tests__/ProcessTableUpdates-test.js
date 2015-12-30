jest.autoMockOff()

describe('ProcessTestInputs', () => {
  var handler = require('../index.js').handler,
    succeed,
    fail

  beforeEach(() => {
    succeed = jest.genMockFn()
    fail = jest.genMockFn()
  })

  it('ignores all records with eventName INSERT', () => {
    let input = require('../fixtures/insert.json')

    handler(input, {succeed, fail})
    expect(succeed.mock.calls.length).toBe(1)
    expect(succeed.mock.calls[0][0]).toEqual({})
    expect(fail.mock.calls.length).toBe(0)
  })

  it('ignores all records with eventName REMOVE', () => {
    let input = require('../fixtures/remove.json')

    handler(input, {succeed, fail})
    expect(succeed.mock.calls.length).toBe(1)
    expect(succeed.mock.calls[0][0]).toEqual({})
    expect(fail.mock.calls.length).toBe(0)
  })

  it('ignores a MODIFY record that does not change the status field', () => {
    let input = require('../fixtures/unchanged.json')
    let id = input.Records[0].dynamodb.Keys.id.S

    handler(input, {succeed, fail})
    expect(succeed.mock.calls.length).toBe(1)
    expect(succeed.mock.calls[0][0][id]).toEqual(true)
    expect(fail.mock.calls.length).toBe(0)
  })

  it('deletes a DynamoDB record for a MODIFY record with status "done"', () => {
    let input = require('../fixtures/done.json')
    let id = input.Records[0].dynamodb.Keys.id.S

    handler(input, {succeed, fail})
    expect(succeed.mock.calls.length).toBe(1)
    expect(succeed.mock.calls[0][0][id]).toEqual(true)
    expect(fail.mock.calls.length).toBe(0)
  })
})
