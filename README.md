# Tools

## NodeJS
*   Install [NodeJS](https://nodejs.org/en/) v4 or v6 would be fine
*   Install [gulp-cli](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) globally: `npm install --global gulp-cli`
*   Install [node-gyp](https://github.com/nodejs/node-gyp) globally: `npm install -g node-gyp`
*   Run `npm install` command at directory .\MAOMAO\mm02ce
*   Finally, run build `gulp build`

## NPM Windows Madness
*   Install special NPM upgrader for Windoze[nlp-win-pgrader](https://github.com/felixrieseberg/npm-windows-upgrade)
*   Pray

## DotNet Core CLI
*  Install [DotNet Core CLI](https://www.microsoft.com/net/core#windows)

# Architecture
## Chrome Extension:
* [React](https://facebook.github.io/react/): A JAVASCRIPT LIBRARY FOR BUILDING USER INTERFACES
* [Redux](https://github.com/reactjs/redux): Predictable state container for JavaScript apps
* [Mobx](https://mobx.js.org/): MobX is a battle tested library that makes state management simple and scalable by transparently applying functional reactive programming (TFRP)
* [react-chrome-redux](https://github.com/tshaddix/react-chrome-redux/wiki/Introduction): How to use redux, react with chrome extension
* [Firebase - Google Login](https://firebase.google.com/docs/auth/web/google-signin) and [Firebase - Facebook Login](https://firebase.google.com/docs/auth/web/facebook-login)
* [React Components that Implement Google's Material Design](http://www.material-ui.com)
* [Webpack v2](https://webpack.js.org/): bundle files
## Web App:
* [NextJs](https://github.com/zeit/next.js): Framework for server-rendered React apps
* [Mobx](https://mobx.js.org/): MobX is a battle tested library that makes state management simple and scalable by transparently applying functional reactive programming (TFRP)
* [Bootstrap v4 beta](https://v4-alpha.getbootstrap.com/)
## API
* DotNet Server
* [Stdlib](http://stdlib.com): StdLib is the easiest way to create, distribute and discover web services. Ship products and build your API business faster than ever before using cutting edge "server-less" technology.

# Troubleshooting

If you meet any [issues](https://github.com/webpack/css-loader/issues/240) with `node-sass`, please type `npm rebuild node-sass` at `mm02ce` directory before running build command `gulp build`
