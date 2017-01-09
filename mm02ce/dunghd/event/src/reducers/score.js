const initialState = {
  im_score: 0,
  audible_pings: 0,
  time_on_tabs: 0,
  url: window.sessionObservable.activeUrl,
};

export default (score = initialState, action) => {
  switch (action.type) {
    case 'IM_SCORE':
      return Object.assign({}, score, window.mm_get_imscore(window.sessionObservable.activeUrl));
    default:
      return score;
  }
};
