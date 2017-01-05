import Promise from 'bluebird';
import GClient from './gclient';
import Config from '../config';

const config = new Config();
let isLoad = false;
let clientId;
let domain;
let scope = 'profile email';
const gclient = new GClient(config.googleApiKey);

function getUserInformation() {
  const currentUser = window.gapi.auth2.getAuthInstance().currentUser.get();
  return {
    id: currentUser.getBasicProfile().getId(),
    name: currentUser.getBasicProfile().getName(),
    email: currentUser.getBasicProfile().getEmail(),
    imageUrl: currentUser.getBasicProfile().getImageUrl(),
    scopes: currentUser.getGrantedScopes(),
  };
}

export default class GAuth2 {
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
    return new Promise((resolve, reject) => {
      if (isLoad === false) {
        gclient.get().then(() => {
          window.gapi.load('client:auth2', () => {
            window.gapi.auth2.init({
              scope,
              client_id: clientId,
              hosted_domain: domain,
            }).then(() => {
              console.log('guth2 is ready');
              isLoad = true;
              resolve();
            });
          });
        }).catch(error => reject(error));
      } else {
        resolve();
      }
    });
  }

  checkAuth() {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          resolve(getUserInformation());
        } else {
          reject();
        }
      });
    });
  }

  login() {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        window.gapi.auth2.getAuthInstance().signIn().then(() => {
          resolve(getUserInformation());
        }, err => reject(err));
      });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        window.gapi.auth2.getAuthInstance().signOut().then(() => {
          resolve();
        }, err => reject(err));
      });
    });
  }
}
