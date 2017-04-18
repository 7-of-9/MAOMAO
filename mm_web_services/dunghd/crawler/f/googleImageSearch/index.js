const cheerio = require('cheerio');
const log = require('loglevel');

module.exports = (params, callback) => {
  log.warn('params.kwargs.bodyHtml', params.kwargs.bodyHtml);
  const $ = cheerio.load(params.kwargs.bodyHtml);
  const result = [];
  $('#res').find('.images_table a').each((index, item) => {
    const img = $(item).find('img');
    const url = $(item).attr('href').replace('/url?q=', '');
    result.push({
      img: img && img.attr('src'),
      description: img && img.attr('alt'),
      url,
    });
  });
  callback(null, { result });
};
