// / <binding BeforeBuild='build' />
require('dotenv').config();
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';
import eventWebpackConfig from './dunghd/event/webpack.config';
import popupWebpackConfig from './dunghd/popup/webpack.config';
import contentWebpackConfig from './dunghd/content/webpack.config';

const plugins = loadPlugins();

gulp.task('popup-js', ['clean'], (cb) => {
  webpack(popupWebpackConfig, (err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    plugins.util.log('[webpack]', stats.toString());

    cb();
  });
});

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

gulp.task('popup-html', ['clean'], () => gulp.src('dunghd/popup/src/index.html')
    .pipe(plugins.rename('popup.html'))
    .pipe(gulp.dest('./app/build')));

gulp.task('clean', (cb) => {
  rimraf('./app/build', cb);
});

gulp.task('build', ['popup-html', 'popup-js', 'event-js', 'content-js']);

gulp.task('watch', ['default'], () => {
  gulp.watch('dunghd/content/**/*', ['build']);
  gulp.watch('dunghd/event/**/*', ['build']);
  gulp.watch('dunghd/popup/**/*', ['build']);
});

gulp.task('default', ['build']);
