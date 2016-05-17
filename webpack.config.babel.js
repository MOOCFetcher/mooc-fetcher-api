var config = require('./gulp/config.js')

function buildEntries() {
  var entries = {}

  Object.keys(config.lambda.entries).forEach((e) => {
    entries[e] = `./${config.lambda.src}/${e}/index.js`
  })
  return entries
}

module.exports = {
  target: 'node',
  entry: buildEntries(),
  externals: ['aws-sdk'],
  output: {
    libraryTarget: 'commonjs',
    path: config.lambda.dest,
    filename: '[name]/index.js'
  },
  module: {
    loaders: [{
      loader: 'babel',
      exclude: /(node_modules|bower_components)/
    },
    {
      test: /\.json$/,
      loader: 'json'
    }]
  }
}
