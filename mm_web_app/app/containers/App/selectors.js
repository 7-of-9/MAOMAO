import { createSelector } from 'reselect';

const selectGlobal = (state) => state.get('global');

const makeSelectLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['loading', 'isGoogleLoading']) ||
    globalState.getIn(['loading', 'isGoogleNewsLoading']) ||
    globalState.getIn(['loading', 'isGoogleKnowledgeLoading']) ||
    globalState.getIn(['loading', 'isYoutubeLoading'])
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

const makeSelectGoogleNews = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'news'])
);

const makeSelectReddit = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['data', 'reddit'])
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
  makeSelectGoogleKnowledge,
  makeSelectGoogle,
  makeSelectGoogleNews,
  makeSelectYoutube,
  makeSelectReddit,
  makeSelectLoading,
  makeSelectError,
  makeSelectLocationState,
};
