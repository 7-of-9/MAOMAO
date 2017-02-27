const cheerio = require('cheerio');
const queryString = require('query-string');

module.exports = (params, callback) => {
  const $ = cheerio.load(params.kwargs.bodyHtml);
  const result = [];
  $('#res').find('.g').each((index, item) => {
    const anchor = $(item).find('h3 a');
    const paragraph = $(item).find('.st');
    if (anchor) {
      const link = anchor.attr('href');
      const parseUrl = queryString.parse(link);
      // TODO: Parse news or images from search result
      // tbm: 'nws' --> news
      // tbm: 'isch' --> images
      if (parseUrl['/url?q']) {
        result.push({
          url: parseUrl['/url?q'],
          title: anchor.text(),
          description: paragraph && paragraph.text(),
        });
      }
    }
  });
  callback(null, { result });
};
