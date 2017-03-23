import firebase from 'firebase';

export default function checkFacebookAuth() {
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    console.warn('checkFacebookAuth', provider);
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const token = result.credential.accessToken;
        const user = result.user;
        return resolve({ token, user });
      })
      .catch(error => reject(error));
  });
  return promise;
}
