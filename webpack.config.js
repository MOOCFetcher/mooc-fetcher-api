module.exports = {
  context: `${__dirname}/src`,
  target: 'node',
  entry: {UpdateCourseraOnDemandCourses: './UpdateCourseraOnDemandCourses/index.js'},
  output: {
    libraryTarget: 'commonjs',
    path: `${__dirname}/dist`,
    filename: '[name]/index.js'
  },
  externals: ['aws-sdk'],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
}
