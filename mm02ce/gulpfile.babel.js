/// <binding BeforeBuild='build' />
require('dotenv').config();
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';

const plugins = loadPlugins();

import eventWebpackConfig from './dunghd/event/webpack.config';
import contentWebpackConfig from './dunghd/content/webpack.config';

gulp.task('event-js', ['clean'], (cb) => {
    webpack(eventWebpackConfig, (err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err);
    plugins.util.log('[webpack]', stats.toString());
    cb();
  });
});

gulp.task('content-js', ['clean'], (cb) => {
    webpack(contentWebpackConfig, (err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err);
    plugins.util.log('[webpack]', stats.toString());
    cb();
  });
});

gulp.task('clean', (cb) => {
  rimraf('./app/build', cb);
});

gulp.task('build', ['event-js', 'content-js']);

gulp.task('watch', ['default'], () => {
  gulp.watch('dunghd/content/**/*', ['build']);
  gulp.watch('dunghd/event/**/*', ['build']);
});

gulp.task('default', ['build']);
