module.exports = {
  context: __dirname + '/lambda_functions',
  entry: {
      ProcessFetchRequest: './ProcessFetchRequest/index.js',
      UploadCourse: './UploadCourse/index.js'
    },
  externals: ['aws-sdk'],
  output: {
    libraryTarget: 'commonjs',
    path: __dirname + '/dist',
    filename: '[name]/index.js'
  }
}
