import * as Crawler from 'crawler';
import * as uuid from 'uuid';
import * as writeJsonFile from 'write-json-file';
import * as querystring from 'querystring';
import * as _ from 'lodash';
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

function generateTopic(result) {
  _.forEach(result, function (portal) {
    const heading = portal.heading;
    _.forEach(portal.items, function (item) {
      crawler.queue([{
        uri: item.link,
        limiter: uuid.v1(),
        callback: (error, result, done) => {
          if (error) {
            console.error(error);
          } else {
            const $ = result.$;
            handler.parsePortalDetail('https://en.wikipedia.org', item.title, result)
              .then(content => {
                writeJsonFile(`./build/json/${heading}/${querystring.escape(item.title)}.json`, content).then(() => {
                  console.log(`${item.title} done`);
                });
              })
              .catch(error => console.warn(error));
          }
          done();
        }
      }]);
    });
  });
}

crawler.queue([{
  uri: STARTED_URL,
  limiter: uuid.v1(),
  callback: (error, result, done) => {
    if (error) {
      console.error(error);
    } else {
      const $ = result.$;
      handler.parsePortalContent('https://en.wikipedia.org', result)
        .then(content => {
          generateTopic(content);
          writeJsonFile('./build/portal.json', content).then(() => {
            console.log('Main Portal done');
          });
        })
        .catch(error => console.warn(error));
    }
    done();
  }
}]);
