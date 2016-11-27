/// <binding BeforeBuild='build' />
require('dotenv').config();
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';

const plugins = loadPlugins();

import eventWebpackConfig from './dunghd/event/webpack.config';
import contentWebpackConfig from './dunghd/content/webpack.config';
import authWebpackConfig from './dunghd/auth/webpack.config';

gulp.task('event-js', ['clean'], (cb) => {
  webpack(eventWebpackConfig, (err) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    cb();
  });
});

gulp.task('content-js', ['clean'], (cb) => {
  webpack(contentWebpackConfig, (err) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    cb();
  });
});

gulp.task('auth-js', ['clean'], (cb) => {
  webpack(authWebpackConfig, (err) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    cb();
  });
});

gulp.task('clean', (cb) => {
  rimraf('./app/build', cb);
});

gulp.task('build', ['event-js', 'content-js', 'auth-js']);

gulp.task('watch', ['default'], () => {
  gulp.watch('dunghd/content/**/*', ['build']);
  gulp.watch('dunghd/event/**/*', ['build']);
  gulp.watch('dunghd/auth/**/*', ['build']);
});

gulp.task('default', ['build']);
