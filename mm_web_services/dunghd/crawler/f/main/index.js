const Crawler = require('crawler');
const lib = require('lib');
const log = require('loglevel');
// const jsdom = require('jsdom');

module.exports = (params, response) => {
  log.warn('params', params);
  const c = new Crawler({
    maxConnections: 10,
    // jQuery: jsdom,
    // This will be called for each crawled page
    callback: (error, res, done) => {
      let $;
      let title = '';
      if (res) {
        $ = res.$;
        title = $('title').text();
      }

      if (error) {
        response(error, null);
      } else {
        switch (params.kwargs.type) {
          case 'google':
            lib['.googleSearch']({ bodyHtml: res.body }, response);
            break;
          case 'image':
            lib['.googleImageSearch']({ bodyHtml: res.body }, response);
            break;
          default:
            response(error, { title, body: res.body, statusCode: res.statusCode });
        }
      }
      done();
    },
  });
  c.queue(params.kwargs.url);
};
