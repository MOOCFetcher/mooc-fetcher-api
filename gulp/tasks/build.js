import gulp from 'gulp'
import gutil from 'gulp-util'
import config from '../config.js'
import webpack from 'webpack'
import webpackConfig from '../../webpack.config.babel.js'

Object.keys(config.lambda.entries).forEach((e) => {
  gulp.task(`${e}:build`, (cb) => {
    var myConfig = Object.create(webpackConfig)

    myConfig.entry = {}
    myConfig.entry[e] = `./${config.lambda.src}/${e}/index.js`
    webpack(myConfig, (err, stats) => {
      if (err) {
        throw new gutil.PluginError('webpack:build', err)
      }

      gutil.log('[webpack:build]', stats.toString({
          colors: true,
          modules: false,
          chunks: false
        }))

      cb()
    })
  })
})

