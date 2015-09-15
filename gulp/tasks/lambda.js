var gulp   = require('gulp')
var lambda = require('gulp-awslambda')
var zip    = require('gulp-zip')
var config = require('../config.json').lambda

function uploadLambdaFunction(params) {
  return gulp.src(params.root)
  .pipe(zip('lambda' + params.name + '.zip'))
  .pipe(lambda(params.name, params.opts))
  .pipe(gulp.dest('dist/'))
}

gulp.task('lambdaProcessFetchRequest', function() {
  var params = config.ProcessFetchRequest

  return uploadLambdaFunction(params)
})

gulp.task('lambdaUploadCourse', function() {
  var params = config.UploadCourse

  return uploadLambdaFunction(params)
})

