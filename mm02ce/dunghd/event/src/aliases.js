import axios from 'axios';
import firebase from 'firebase';

function checkAuth() {
    const promise = new Promise((resolve, reject) => {
        let retry = true; // retry once when get error
        function getTokenAndXhr() {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                } else if (token) {
                    const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
                    firebase.auth().signInWithCredential(credential).catch(error => reject(error));
                    return axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
                        .then(response => resolve({ token, info: response.data }))
                        .catch((error) => {
                            if (error.response.status === 401 && retry) {
                                retry = false;
                                chrome.identity.removeCachedAuthToken({ token }, getTokenAndXhr);
                                return;
                            }
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
                .then(data => dispatch(
                    actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info })),
            )
                .catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
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
                .then(data => dispatch(
                    actionCreator('AUTH_FULFILLED', { token: data.token, info: data.info })),
            ).catch((error) => {
                // Try to logout and remove cache token
                if (firebase.auth().currentUser) {
                    firebase.auth().signOut();
                }

                chrome.identity.removeCachedAuthToken({ token: '' }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    }
                });

                dispatch(actionCreator('AUTH_REJECTED', { error }));
            });
        }
        return dispatch(
            actionCreator('AUTH_FULFILLED', { token: auth.token, info: auth.info }),
        );
    }
);

export default {
    AUTH_LOGIN: authLogin,
    AUTH_LOGOUT: authLogout,
};
