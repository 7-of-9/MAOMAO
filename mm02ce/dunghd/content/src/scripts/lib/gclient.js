import Promise from 'bluebird';

let loadAPI = false;
let loadingAPI = false;
let apiKey = null;
const observers = [];
const URL = 'https://apis.google.com/js/client:platform.js?onload=gapiOnLoad';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    window.gapiOnLoad = function gapiOnLoad() {
      console.log('gapiOnLoad for google client js');
      resolve();
    };
    const script = document.createElement('script');
    script.onerror = function onerror(e) {
      reject(e);
    };
    script.src = src;
    document.head.appendChild(script);
  });
}

export default class GClient {
  constructor(key = null) {
    apiKey = key;
  }

  get() {
    return new Promise((resolve, reject) => {
      if (loadAPI) {
        resolve();
      } else {
        if (loadingAPI) {
          observers.push(this);
        } else {
          loadingAPI = true;
          loadScript(URL).then(() => {
            window.gapi.client.setApiKey(apiKey);
            loadAPI = true;
            loadingAPI = false;
            resolve();
            for (let i = 0; i < observers.length; i++) {
              observers[i].resolve();
            }
          }).catch(error => reject(error));
        }
      }
    });
  }

  setApiKey(key) {
    apiKey = key;
    if (loadAPI) {
      window.gapi.client.setApiKey(apiKey);
    }
  }

  getApiKey() {
    return apiKey;
  }
}
