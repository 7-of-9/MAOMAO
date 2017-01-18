import * as Crawler from 'crawler';
import * as uuid from 'uuid';
import * as writeJsonFile from 'write-json-file';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
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
  Promise.map(result, (portal) => {
    return Promise.map(portal.items, (item) => {
      return new Promise((resolve, reject) => {
        crawler.queue([{
          uri: item.link,
          limiter: uuid.v1(),
          callback: (error, response, done) => {
            if (error) {
              reject(error);
            } else {
              handler.parsePortalDetail('https://en.wikipedia.org', item.title, response)
                .then(content => resolve(content))
                .catch(error => reject(error));
            }
            done();
          }
        }]);
      });
    });
  }).then(resp => {
    let data = _.flatten(resp);
    writeJsonFile('./build/topics.json', data).then(() => {
      console.log('Topics done');
    });
  }).catch(err => console.warn(err));
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
