import axios from 'axios';
import firebase from 'firebase';
import { queryString, actionCreator } from './utils';
import { checkGoogleAuth } from './social/google';
import checkFacebookAuth from './social/facebook';

export function googleAutoLogin(store, syncImScore, config, googleUserId, user) {
  console.warn('googleAutoLogin');
  checkGoogleAuth()
    .then((data) => {
      store.dispatch(actionCreator('USER_HASH', { userHash: googleUserId }));
      store.dispatch(actionCreator('AUTH_FULFILLED', data));
      store.dispatch({
        type: 'FETCH_CONTACTS',
      });
      syncImScore(false);
      const names = user.displayName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1, names.length).join(' ');
      axios({
        method: 'post',
        url: `${config.apiUrl}/user/google`,
        data: queryString({
          firstName,
          lastName,
          email: user.email,
          avatar: user.photoURL,
          google_user_id: googleUserId,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((newUser) => {
        let userId = -1;
        if (newUser.data && newUser.data.id) {
          userId = newUser.data.id;
        }
        store.dispatch({
          type: 'USER_AFTER_LOGIN',
          payload: {
            userId,
          },
        });
        window.userId = userId;
        window.isGuest = false;
    }).catch(error => console.warn(error));
    }).catch((error) => {
      // Try to logout and remove cache token
      if (firebase.auth().currentUser) {
        firebase.auth().signOut();
      }
      store.dispatch(actionCreator('AUTH_REJECTED', { error }));
    });
}

export function facebookAutoLogin(store, syncImScore, config, facebookUserId, email, user) {
  console.warn('facebookAutoLogin');
  checkFacebookAuth()
    .then((data) => {
      store.dispatch(actionCreator('USER_HASH', { userHash: facebookUserId }));
      store.dispatch(actionCreator('AUTH_FULFILLED', data));
      syncImScore(false);
      const names = user.displayName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1, names.length).join(' ');
      axios({
        method: 'post',
        url: `${config.apiUrl}/user/fb`,
        data: queryString({
          firstName,
          lastName,
          email,
          avatar: user.photoURL,
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
        store.dispatch({
          type: 'USER_AFTER_LOGIN',
          payload: {
            userId,
          },
        });
        window.userId = userId;
        window.isGuest = false;
      }).catch(error => console.warn(error));
    }).catch((error) => {
      // Try to logout and remove cache token
      if (firebase.auth().currentUser) {
        firebase.auth().signOut();
      }
      store.dispatch(actionCreator('AUTH_REJECTED', { error }));
    });
}
