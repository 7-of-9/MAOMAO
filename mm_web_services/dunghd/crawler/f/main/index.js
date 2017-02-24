/* Import dependencies, declare constants */
const Crawler = require('crawler');
/**
* Your function call
* @param {Object} params Execution parameters
*   Members
*   - {Array} args Arguments passed to function
*   - {Object} kwargs Keyword arguments (key-value pairs) passed to function
*   - {String} remoteAddress The IPv4 or IPv6 address of the caller
*
* @param {Function} callback Execute this to end the function call
*   Arguments
*   - {Error} error The error to show if function fails
*   - {Any} returnValue JSON serializable (or Buffer) return value
*/
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
      response(error, { title, body: res.body, statusCode: res.statusCode });
      done();
    },
  });
  c.queue(params.kwargs.url);
};
