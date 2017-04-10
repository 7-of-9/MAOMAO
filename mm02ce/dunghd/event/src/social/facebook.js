import firebase from 'firebase';
import * as logger from 'loglevel';

export default function checkFacebookAuth(isLinked) {
  logger.warn('checkFacebookAuth', isLinked, firebase.auth().currentUser);
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    if (firebase.auth().currentUser && isLinked) {
      firebase.auth().currentUser.linkWithPopup(provider).then((result) => {
        const facebookToken = result.credential.accessToken;
        const user = result.user;
        let email = '';
        let facebookUserId = '';
        if (user.providerData && user.providerData.length) {
          for (let counter = 0; counter < user.providerData.length; counter += 1) {
            if (user.providerData[counter].providerId === 'facebook.com') {
              facebookUserId = user.providerData[counter].uid;
              email = user.providerData[counter].email;
              break;
            }
          }
        }
        return resolve({
          facebookUserId,
          facebookToken,
          info: {
            name: user.displayName,
            email,
            picture: user.photoURL,
          },
        });
      }).catch(error => reject(error));
    } else {
      firebase.auth().signInWithPopup(provider).then((result) => {
        const facebookToken = result.credential.accessToken;
        const user = result.user;
        let email = '';
        let facebookUserId = '';
        if (user.providerData && user.providerData.length) {
          for (let counter = 0; counter < user.providerData.length; counter += 1) {
            if (user.providerData[counter].providerId === 'facebook.com') {
              facebookUserId = user.providerData[counter].uid;
              email = user.providerData[counter].email;
              break;
            }
          }
        }
        return resolve({
          facebookUserId,
          facebookToken,
          info: {
            name: user.displayName,
            email,
            picture: user.photoURL,
          },
        });
      }).catch(error => reject(error));
    }
  });
  return promise;
}
