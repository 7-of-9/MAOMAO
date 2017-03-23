import firebase from 'firebase';

export default function checkFacebookAuth() {
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    firebase.auth().signInWithPopup(provider).then((result) => {
      const token = result.credential.accessToken;
      const user = result.user;
      let email = '';
      console.warn('facebook user', user, result);
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
        token,
        info: {
          name: user.displayName,
          email,
          picture: user.photoURL,
       },
      });
    }).catch(error => reject(error));
  });
  return promise;
}
