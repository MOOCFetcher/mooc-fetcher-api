import gulp from 'gulp'
import lambda from 'gulp-awslambda'
import zip from 'gulp-zip'
import config from '../config.js'

function uploadLambdaFunction(name) {
  return gulp.src(`${config.lambda.dest}/${name}/index.js`)
  .pipe(zip(`${name}.zip`))
  .pipe(lambda({
    FunctionName: name,
    Publish: true
  }, config.lambda.opts))
  .pipe(gulp.dest(`${config.lambda.dest}`))
}

Object.keys(config.lambda.entries).forEach((e) => {
  gulp.task(`${e}:upload`, [`${e}:build`], () => {
    uploadLambdaFunction(e)
  })
})

