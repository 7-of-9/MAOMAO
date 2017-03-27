import axios from 'axios';
import firebase from 'firebase';
import { guid, queryString } from '../utils';

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

export function checkGoogleAuth(isLinked = false) {
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.me');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.google.com/m8/feeds/');
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    if (firebase.auth().currentUser && isLinked) {
      firebase.auth().currentUser.linkWithPopup(provider).then((result) => {
        const token = result.credential.accessToken;
        const user = result.user;
        let googleUserId = '';
        let googleEmail = '';
        if (user.providerData && user.providerData.length) {
          for (let counter = 0; counter < user.providerData.length; counter += 1) {
            if (user.providerData[counter].providerId === 'google.com') {
              googleUserId = user.providerData[counter].uid;
              googleEmail = user.providerData[counter].email;
              break;
            }
          }
        }
        return resolve({
          googleUserId,
          token,
          info: {
            name: user.displayName,
            email: user.email || googleEmail,
            picture: user.photoURL,
          },
        });
      }).catch(error => reject(error));
    } else {
      firebase.auth().signInWithPopup(provider).then((result) => {
        const token = result.credential.accessToken;
        const user = result.user;
        let googleUserId = '';
        let googleEmail = '';
        if (user.providerData && user.providerData.length) {
          for (let counter = 0; counter < user.providerData.length; counter += 1) {
            if (user.providerData[counter].providerId === 'google.com') {
              googleUserId = user.providerData[counter].uid;
              googleEmail = user.providerData[counter].email;
              break;
            }
          }
        }
        return resolve({
          googleUserId,
          token,
          info: {
            name: user.displayName,
            email: user.email || googleEmail,
            picture: user.photoURL,
          },
        });
      }).catch(error => reject(error));
    }
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
