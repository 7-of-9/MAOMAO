const Crawler = require('crawler');
const lib = require('lib');

module.exports = (params, response) => {
  const c = new Crawler({
    maxConnections: 10,
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
          default:
            response(error, { title, body: res.body, statusCode: res.statusCode });
        }
      }
      done();
    },
  });
  c.queue(params.kwargs.url);
};
