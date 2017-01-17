import * as Crawler from 'crawler';
import * as uuid from 'uuid';
import * as writeJsonFile from 'write-json-file';
import url from 'url';

import WikiPedia from './sites/WikiPedia';

const MAX_CONNECTIONS = 10;
const RARE_LIMIT = 1000;
const STARTED_URL = 'https://en.wikipedia.org/wiki/Portal:Contents/Portals';
const crawler = new Crawler({
  maxConnections: MAX_CONNECTIONS,
  rateLimit: RARE_LIMIT,
});

const handler = new WikiPedia();

crawler.queue([{
  uri: STARTED_URL,
  limiter: uuid.v1(),
  callback: (error, result, done) => {
    if (error) {
      console.error(error);
    } else {
      const $ = result.$;
      console.log($("title").text());
      handler.parsePortalContent('https://en.wikipedia.org', result)
        .then(content => {
          writeJsonFile('./build/portal.json', content).then(() => {
            console.log('done');
          });
        })
        .catch(error => console.warn(error));
    }
    done();
  }
}]);
