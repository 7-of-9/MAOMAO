import axios from 'axios';
import logger from './logger';
import guid from './guid';

function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

function buildUrlPath(params) {
  let options = {
    type: 'contacts',
    alt: 'json',
    projection: 'full',
    email: 'default',
    limit: 5000,
    page: 1,
    v: '3.0',
    orderby: 'lastmodified',
    sortby: 'descending',
  };
  options = Object.assign(options, params);

  const query = {
    alt: options.alt,
    'max-results': options.limit,
    'start-index': ((options.page - 1) * options.limit) + 1,
    v: options.v,
    orderby: options.orderby,
    sortorder: options.sortby,
  };

  const path = `https://www.google.com/m8/feeds/${options.type}/${options.email}/${options.projection}?${queryString(query)}`;
  return path;
}

function fetchContacts(token, opts) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('Missing OAuth token'));
    }

    const url = buildUrlPath(opts);
    return axios.get(url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (response.status > 300 || response.status < 200) {
          return reject(new Error(`Status code: ${response.statusCode}`));
        }
        logger.info('contacts data', response.data);
        const data = response.data;
        const contacts = [];
        let total = 0;
        const page = opts.page || 1;
        if (data.feed && data.feed.entry) {
          total = Number(data.feed.openSearch$totalResults.$t);
          data.feed.entry.forEach((item) => {
            const ref = item.gd$email;
            if (ref && ref[0] && ref[0].address) {
              contacts.push({
                email: ref[0].address,
                name: item.title.$t,
                key: guid(),
              });
            }
          });
        }
        return resolve({
          total,
          page,
          data: contacts,
        });
      })
      .catch(error => reject(error));
  });
}

export default fetchContacts;
