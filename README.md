# Tools

## NodeJS

*   Install [NodeJS](https://nodejs.org/en/) v4 or v6 would be fine
*   Install [gulp-cli](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) globally: `npm install --global gulp-cli`
*   Install [node-gyp](https://github.com/nodejs/node-gyp) globally: `npm install -g node-gyp`
*   Run `npm install` command at directory .\MAOMAO\mm02ce
*   Finally, run build `gulp build`

## DotNet Core CLI

*  Install [DotNet Core CLI](https://www.microsoft.com/net/core#windows)

# Architecture
* [Redux](https://github.com/reactjs/redux): Predictable state container for JavaScript apps
* [react-chrome-redux](https://github.com/tshaddix/react-chrome-redux/wiki/Introduction): How to use redux, react with chrome extension
* [Chrome Identify](http://stackoverflow.com/questions/25044936/chrome-identity-user-authentication-in-a-chrome-extension) in a chrome extension

# UI package for chrome extension

* [React Components that Implement Google's Material Design](http://www.material-ui.com)

# Troubleshooting

If you meet any [issues](https://github.com/webpack/css-loader/issues/240) with `node-sass`, please type `npm rebuild node-sass` at `mm02ce` directory before running build command `gulp build`