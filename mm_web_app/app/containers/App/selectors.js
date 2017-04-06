import { createSelector } from 'reselect';

const selectGlobal = (state) => state.get('global');

const makeSelectLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['loading', 'isGoogleLoading']) ||
    globalState.getIn(['loading', 'isGoogleNewsLoading']) ||
    globalState.getIn(['loading', 'isGoogleKnowledgeLoading']) ||
    globalState.getIn(['loading', 'isYoutubeLoading'])
);

const makeSelectHomeLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['loading', 'isUserHistoryLoading']) ||
    globalState.getIn(['loading', 'isGoogleConnectLoading']) ||
    globalState.getIn(['loading', 'isFacebookConnectLoading'])
);


const makeSelectError = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('error')
);

const makeSelectGoogleKnowledge = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'knowledge'])
);

const makeSelectYoutube = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'youtube'])
);

const makeSelectGoogle = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'google'])
);

const makeSelectGoogleConnect = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'googleConnect'])
);

const makeSelectFacebookConnect = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'facebookConnect'])
);

const makeSelectCurrentUser = () => createSelector(
  selectGlobal,
  (globalState) => {
    const googleUser = globalState.getIn(['data', 'googleConnect', 'user']).toJS();
    const facebookUser = globalState.getIn(['data', 'facebookConnect', 'user']).toJS();
    if (googleUser.id > 0) {
      return googleUser;
    }
    if (facebookUser.id > 0) {
      return facebookUser;
    }
    return googleUser;
  }
);

const makeSelectGoogleNews = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'news'])
);

const makeSelectReddit = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'reddit'])
);

const makeSelectUserHistory = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'userHistory'])
);

const makeSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export {
  selectGlobal,
  makeSelectCurrentUser,
  makeSelectGoogle,
  makeSelectGoogleNews,
  makeSelectGoogleConnect,
  makeSelectFacebookConnect,
  makeSelectGoogleKnowledge,
  makeSelectUserHistory,
  makeSelectYoutube,
  makeSelectReddit,
  makeSelectLoading,
  makeSelectHomeLoading,
  makeSelectError,
  makeSelectLocationState,
};
