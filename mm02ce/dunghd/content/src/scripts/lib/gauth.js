import Promise from 'bluebird';
import GClient from './gclient';
import Config from '../config';

const config = new Config();
let isLoad = false;
let clientId;
let domain;
let scope = 'https://www.googleapis.com/auth/userinfo.email';
const responseType = 'token id_token';
const gclient = new GClient(config.googleApiKey);

function loadApi() {
  return new Promise((resolve, reject) => {
    if (isLoad === false) {
      gclient.get().then(() => {
        window.gapi.client.load('oauth2', 'v2', () => {
          console.log('goauth2 is ready');
          isLoad = true;
          resolve();
        });
      }).catch(error => reject(error));
    } else {
      resolve();
    }
  });
}

function signin(mode, authorizeCallback) {
  function executeSignin() {
    const option = { scope, client_id: clientId, immediate: false, authuser: -1, response_type: responseType };

    if (mode) {
      option.immediate = true;
    }

    if (domain !== undefined) {
      option.hd = domain;
    }
    window.gapi.auth.authorize(option, authorizeCallback);
  }

  if (!mode && isLoad === true) {
    // don't break the caller stack with async tasks
    executeSignin(mode, authorizeCallback);
  } else {
    loadApi().then(() => {
      executeSignin(mode, authorizeCallback);
    });
  }
}

function getUser() {
  return new Promise((resolve, reject) => {
    window.gapi.client.oauth2.userinfo.get().execute((response) => {
      if (!response.code) {
        resolve(response);
      } else {
        reject();
      }
    });
  });
}


export default class GAuth {
  setClient(value) {
    clientId = value;
  }

  setDomain(value) {
    domain = value;
  }

  setScope(value) {
    scope = value;
  }

  load() {
    loadApi();
  }

  checkAuth() {
    return new Promise((resolve, reject) => {
      signin(true, () => {
        getUser().then((user) => {
          resolve(user);
        }, () => reject());
      });
    });
  }

  login() {
    return new Promise((resolve, reject) => {
      signin(false, () => {
        getUser().then(user => resolve(user), () => reject());
      });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        window.gapi.auth.setToken(null);
        resolve();
      }, () => reject());
    });
  }
}
