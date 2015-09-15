exports.handler = function(event, context) {
  console.log('\n\n****** CONTEXT ********\n', context)
  console.log('\n\n****** EVENT *******\n', event)
  context.succeed()
}
