import axios from 'axios';
import firebase from 'firebase';
import { batchActions } from 'redux-batched-actions';
import * as logger from 'loglevel';
import { checkGoogleAuth, fetchContacts } from './social/google';
import checkFacebookAuth from './social/facebook';
import { shareAll, shareThisSite, shareTheTopic, fbScrapeShareUrl } from './sharelink';
import { actionCreator, notifyMsg, queryString } from './utils';
import Config from './config';

const throttledQueue = require('throttled-queue');

const config = new Config();
const throttle = throttledQueue(10, 1000); // at most make 10 request every second.

function logout(auth) {
  const promise = new Promise((resolve, reject) => {
    // revoke token
    if (auth.googleUserId && auth.googleToken) {
      // revoke token for google
      axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${auth.googleToken}`)
        .then(response => logger.info('revoke', response))
        .catch(error => logger.error('revoke error', error));
    }

    if (auth.facebookUserId && auth.facebookToken) {
      // revoke token for fb
      axios.delete(`https://graph.facebook.com/${auth.facebookUserId}/permissions?access_token=${auth.facebookToken}`)
        .then(response => logger.info('revoke', response))
        .catch(error => logger.error('revoke error', error));
    }

    // logout firebase
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    }

    // NOTE: set value for bg_session.js
    if (auth.googleUserId && auth.googleToken) {
      chrome.identity.removeCachedAuthToken({ token: auth.googleToken }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          // validate token
          resolve({ token: '', info: {} });
        }
      });
    } else {
      resolve({ token: '', info: {} });
    }
  });
  return promise;
}

function base64ImageFromUrl(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = (ev) => {
    if (ev.target && ev.target.status === 200) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(null, reader.result);
      };
      reader.readAsDataURL(xhr.response);
    } else {
      callback(new Error(`Not found image, error code ${ev.target.status}`));
    }
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

function downloadPhoto(dispatch, contacts) {
  const photos = [];
  contacts.forEach((contact) => {
    if (contact.image && contact.image.indexOf('http') !== -1) {
      throttle(() => {
        base64ImageFromUrl(contact.image, (err, base64Image) => {
          if (err) {
            photos.push({
              ...contact,
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAKlBMVEXMzMz////8/Pza2trQ0NDf39/29vbW1tbp6ens7Ozy8vL5+fni4uLm5uZ/0ezOAAAB3UlEQVRo3u2XvUoDURCFE4y6MRY5GzbEoMWCIAhCbAStRFAsk9Y0Bn2A4BNswAeI2FoYxT4g6bW01CeysNAku7Mz99jlfv0c7s+cuecWPB6PZ0FY/XgCsPvQd6w/jPFDeO9SXuril8mxXeALf9kz1x9gmitjfYBZEtsB9DBL3XQMN5hnx9IAMeYJ+6YFUEsoxUgjVJ/CCtK51AoMkE5DWb+ELFrqHXB7+EQWW4Y7IO5hGdm0NQIVQWCsEdgXBGoagTtBYEMjEAsCocaJkFA4ch0Sb/kCZUgM8wXWIPGYL1CERNULLIgA0UhEK7Nm4u3MDxR+pPFDlR/r/MPCP23848o/73zA4CMOH7L4mMcHTT7q8mGbj/v8h6NwOsI0r44/PsDp63eBFF709V2kMtHWHyGDZ139OTK5VZk5FqZ6S9FCAwg08rvpDCLXRhvZHdVBDpHiTZBpcwsAInIB8hI6UBCps4U9ZJxAxbY4x2Tk4RZASSJEExU15XtkjQkB1CTCDog9jKCmKbaxaztXYGAs+cDVDyMYaGqTlSFulWFiKDjR0ZEdmIhUvwTTxwFGxEtwuYYARhJlulUH9yKMVOVhYB8J7zCyKXwRVDRkL9r92IOROtmIgBfwAv8owLfyN0kjHr6c7ddbAAAAAElFTkSuQmCC',
            });
          } else {
            photos.push({
              ...contact,
              image: base64Image,
            });
          }
        });
      });
    }
  });
  throttle(() => {
    setTimeout(() => {
      // TODO: Update store
      dispatch(actionCreator('DOWNLOAD_PHOTO_DONE', { photos }));
    }, 1000);
  });
}

const authLogout = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      logout(auth)
        .then(data => dispatch(actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info })))
        .catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
    } else {
      dispatch(
        actionCreator('LOGOUT_FULFILLED', { token: '', info: {} }),
      );
    }
    dispatch(actionCreator('USER_AFTER_LOGOUT'));
    return dispatch(actionCreator('MAOMAO_ENABLE', { url: window.sessionObservable.activeUrl }));
  }
);

const authGoogleLogin = data => (
  (dispatch, getState) => {
    const { isLinked } = data.payload;
    const { auth } = getState();
    if (!auth.isPending || auth.googleToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkGoogleAuth(isLinked)
        .then((result) => {
          if (!isLinked) {
            dispatch(actionCreator('USER_HASH', { userHash: result.googleUserId }));
          }
          return dispatch(actionCreator('AUTH_FULFILLED', result));
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          return dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }

    return dispatch(batchActions([
      actionCreator('AUTH_FULFILLED', { googleUserId: auth.googleUserId, googleToken: auth.googleToken, info: auth.info }),
      actionCreator('USER_HASH', { userHash: auth.googleUserId }),
    ]));
  }
);

const authFacebookLogin = data => (
  (dispatch, getState) => {
    const { isLinked } = data.payload;
    const { auth } = getState();
    if (!auth.isPending || auth.facebookToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkFacebookAuth(isLinked)
        .then((result) => {
          if (!isLinked) {
            dispatch(actionCreator('USER_HASH', { userHash: result.facebookUserId }));
          }
          dispatch(actionCreator('AUTH_FULFILLED', result));
          const { info, facebookUserId, error } = result;
          if (error) {
            return dispatch(actionCreator('AUTH_REJECTED', { error }));
          }
          const names = info.name.split(' ');
          const firstName = names[0];
          const lastName = names.slice(1, names.length).join(' ');
          return axios({
            method: 'post',
            url: `${config.apiUrl}/user/fb`,
            data: queryString({
              firstName,
              lastName,
              email: info.email,
              avatar: info.picture,
              fb_user_id: facebookUserId,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }).then((newUser) => {
            let userId = -1;
            if (newUser.data && newUser.data.id) {
              userId = newUser.data.id;
            }
            dispatch(actionCreator('USER_AFTER_LOGIN', { userId }));
            return dispatch(actionCreator('PRELOAD_SHARE_ALL', { userId }));
          }).catch(err => logger.warn(err));
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          return dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }
    return dispatch(batchActions([
      actionCreator('AUTH_FULFILLED', { facebookUserId: auth.facebookUserId, facebookToken: auth.facebookToken, info: auth.info }),
      actionCreator('USER_HASH', { userHash: auth.facebookUserId }),
    ]));
  }
);


const getContacts = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    dispatch({
      type: 'FETCH_CONTACTS_PENDING',
    });
    return fetchContacts(auth.googleToken, 1, 1000)
      .then((data) => {
        // Download images
        downloadPhoto(dispatch, data.data);
        dispatch(actionCreator('FETCH_CONTACTS_FULFILLED', data));
      },
    ).catch((error) => {
      dispatch(actionCreator('FETCH_CONTACTS_REJECTED', { error }));
    });
  }
);

const googleContacts = () => (
  dispatch => checkGoogleAuth(false)
    .then((result) => {
      dispatch(actionCreator('GOOGLE_CONTACTS_FULFILLED', result));
    }).catch((error) => {
      dispatch(actionCreator('GOOGLE_CONTACTS_REJECTED', { error }));
    })
);

const notifyUI = data => (
  () => {
    const { title, message, imageUrl } = data.payload;
    notifyMsg(title, message, imageUrl);
  }
);

/* eslint-disable camelcase */
const generateShare = data => (
  (dispatch, getState) => {
    const { auth: { userId, userHash }, code: { sites, topics } } = getState();
    const { data: { url_id, tld_topic_id, tld_topic } } = data.payload;
    const findUrlCode = sites.find(item => item && item.url_id === url_id);
    const findTopicCode = topics.find(item => item && item.id === tld_topic_id);
    if (!findTopicCode && tld_topic_id) {
      shareTheTopic(userId, userHash, tld_topic_id)
        .then((result) => {
          const { share_code } = result.data;
          fbScrapeShareUrl(share_code);
          dispatch(actionCreator('SHARE_TOPIC_SUCCESS', { ...result.data, id: tld_topic_id, name: tld_topic }));
        }).catch((error) => {
          dispatch(actionCreator('SHARE_TOPIC_ERROR', { error }));
        });
    }

    if (!findUrlCode && url_id) {
      shareThisSite(userId, userHash, url_id)
        .then((result) => {
          const { share_code } = result.data;
          fbScrapeShareUrl(share_code);
          dispatch(actionCreator('SHARE_URL_SUCCESS', { ...result.data, url_id }));
        }).catch((error) => {
          dispatch(actionCreator('SHARE_URL_ERROR', { error }));
        });
    }
  }
);

const generateShareTopics = data => (
  (dispatch, getState) => {
    const { auth: { userId, userHash }, code: { topics } } = getState();
    const { topics: topicsInput } = data.payload;
    logger.warn('topicsInput', topicsInput);
    if (topicsInput && topicsInput.length) {
      topicsInput.forEach(({ term_id, term_name }) => {
        const findTopicCode = topics.find(item => item && item.id === term_id);
        if (!findTopicCode) {
          shareTheTopic(userId, userHash, term_id)
            .then((result) => {
              const { share_code } = result.data;
              fbScrapeShareUrl(share_code);
              dispatch(actionCreator('SHARE_TOPIC_SUCCESS', { ...result.data, id: term_id, name: term_name }));
            }).catch((error) => {
              dispatch(actionCreator('SHARE_TOPIC_ERROR', { error }));
            });
        }
      });
    }
  }
);

const generateShareAll = data => (
  (dispatch, getState) => {
    const { userId } = data.payload;
    const { auth: { userHash } } = getState();
    shareAll(userId, userHash)
      .then((result) => {
        const { share_code } = result.data;
        fbScrapeShareUrl(share_code);
        dispatch(actionCreator('SHARE_ALL_SUCCESS', result.data));
      }).catch((error) => {
        dispatch(actionCreator('SHARE_ALL_ERROR', { error }));
      });
  }
);

const webCheckAuth = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    return dispatch(actionCreator('WEB_CHECK_AUTH_RESULT', auth));
  }
);

export default {
  WEB_CHECK_AUTH: webCheckAuth,
  AUTH_LOGIN_GOOGLE: authGoogleLogin,
  AUTH_LOGIN_FACEBOOK: authFacebookLogin,
  AUTH_LOGOUT: authLogout,
  FETCH_CONTACTS: getContacts,
  GOOGLE_CONTACTS: googleContacts,
  PRELOAD_SHARE: generateShare,
  PRELOAD_SHARE_ALL: generateShareAll,
  GENERATE_SHARE_TOPICS: generateShareTopics,
  NOTIFY_MESSAGE: notifyUI,
};
