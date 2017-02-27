const cheerio = require('cheerio');
const queryString = require('query-string');

module.exports = (params, callback) => {
  const $ = cheerio.load(params.kwargs.bodyHtml);
  const result = [];
  $('#res').find('.g').each((index, item) => {
    const anchor = $(item).find('h3 a');
    const paragraph = $(item).find('.st');
    const img = $(item).find('img');
    if (anchor) {
      const link = anchor.attr('href');
      const parseUrl = queryString.parse(link);
      if (parseUrl['/url?q']) {
        result.push({
          url: parseUrl['/url?q'],
          title: anchor.text(),
          img: img && img.attr('src'),
          description: paragraph && paragraph.text(),
        });
      }
    }
  });
  callback(null, { result });
};
