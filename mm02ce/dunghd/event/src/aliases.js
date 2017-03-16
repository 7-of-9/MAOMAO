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

function checkAuth() {
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
              console.warn(error);
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

function logout(token) {
  const promise = new Promise((resolve, reject) => {
    // revoke token
    axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then(response => console.log('revoke', response))
      .catch(error => console.log('revoke error', error));
    // logout firebase
    if (firebase.auth().currentUser) {
      console.log('firebase logout');
      firebase.auth().signOut();
    }

    // NOTE: set value for bg_session.js
    window.isGuest = true;
    window.userId = -1;
    window.userHash = '';
    window.enableTestYoutube = false;

    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // validate token
        resolve({ token: '', info: {} });
      }
    });
  });
  return promise;
}


function fetchContacts(token, page, limit) {
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

function actionCreator(type, payload) {
  return {
    type,
    payload,
  };
}


const authLogout = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return logout(auth.accessToken)
        .then((data) => {
          dispatch(actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info }));
          dispatch(actionCreator('USER_AFTER_LOGOUT'));
        }).catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
    }
    return dispatch(
      actionCreator('LOGOUT_FULFILLED', { token: '', info: {} }),
    );
  }
);


const authLogin = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending || auth.accessToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkAuth()
        .then((data) => {
          dispatch(actionCreator('USER_HASH', { userHash: data.info.sub }));
          dispatch(actionCreator('AUTH_FULFILLED', data));
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }
    dispatch(actionCreator('USER_HASH', { userHash: auth.info.sub }));
    return dispatch(
      actionCreator('AUTH_FULFILLED', { token: auth.token, info: auth.info }),
    );
  }
);

const getContacts = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    dispatch({
      type: 'FETCH_CONTACTS_PENDING',
    });
    return fetchContacts(auth.accessToken, 1, 1000)
      .then(data => dispatch(
        actionCreator('FETCH_CONTACTS_FULFILLED', data)),
    ).catch((error) => {
      dispatch(actionCreator('FETCH_CONTACTS_REJECTED', { error }));
    });
  }
);


export default {
  AUTH_LOGIN: authLogin,
  AUTH_LOGOUT: authLogout,
  FETCH_CONTACTS: getContacts,
};
