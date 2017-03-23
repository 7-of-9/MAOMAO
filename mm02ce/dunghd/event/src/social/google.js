import axios from 'axios';
import firebase from 'firebase';

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}${s4()}`;
}

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

export function checkGoogleAuth() {
  const promise = new Promise((resolve, reject) => {
    let retry = true; // retry once when get error
    function getTokenAndXhr() {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        } else if (token) {
          const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
          firebase.auth()
            .signInWithCredential(credential)
            .catch(error => console.warn(error));
          return axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
            .then(response => resolve({ token, info: response.data }))
            .catch((error) => {
              if (error.response.status === 401 && retry) {
                retry = false;
                chrome.identity.removeCachedAuthToken({ token }, getTokenAndXhr);
                return;
              }
              console.error(error);
              reject(error);
            });
        }
        return reject(new Error('The OAuth Token was null'));
      });
    }
    getTokenAndXhr();
  });
  return promise;
}

export function fetchContacts(token, page, limit) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('Missing OAuth token'));
    }

    const url = buildUrlPath({ page, limit });
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
        const data = response.data;
        const contacts = [];
        let total = 0;
        if (data.feed && data.feed.entry) {
          total = Number(data.feed.openSearch$totalResults.$t);
          data.feed.entry.forEach((item) => {
            const ref = item.gd$email;
            let image = '';
            if (item.link && item.link[0] && item.link[0].href) {
              image = `${item.link[0].href}&access_token=${token}`;
            }
            if (ref && ref[0] && ref[0].address) {
              contacts.push({
                email: ref[0].address,
                name: item.title.$t,
                key: guid(),
                image,
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
