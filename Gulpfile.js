var gutil      = require('gulp-util')
var requireDir = require('require-dir')

// 'development' is just default, production overrides are triggered by adding
// the production flag to the gulp command e.g. `gulp build --production`
global.isProduction = (gutil.env.production === true)

requireDir('./gulp/tasks', {recurse: true})

