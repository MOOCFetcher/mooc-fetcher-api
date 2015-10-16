module.exports = {
  context: __dirname + '/lambda_functions',
  target: 'node',
  entry: {
      ProcessFetchRequest: './ProcessFetchRequest/index.js',
      UploadCourse: './UploadCourse/index.js',
      UpdateCourseraOnDemandCourses: './UpdateCourseraOnDemandCourses/index.js'
    },
  externals: ['aws-sdk'],
  output: {
    libraryTarget: 'commonjs',
    path: __dirname + '/dist',
    filename: '[name]/index.js'
  },
  module: {
    loaders: [
    {
      loader: 'babel?stage=0',
      exclude: /(node_modules|bower_components)/
    },
    {
      test: /\.json$/,
      loader: 'json'
    }
  ]
  }
}
