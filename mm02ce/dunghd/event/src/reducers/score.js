const initialState = {
  im_score: 0,
  audible_pings: 0,
  time_on_tabs: 0,
  isOpen: false,
  url: '',
  updateAt: Date.now(),
  histories: [],
};

export default (score = initialState, action) => {
  switch (action.type) {
    case 'IM_ALLOWABLE':
      return Object.assign({}, score, action.payload);
    case 'IM_SAVE_SUCCESS':
    case 'IM_SAVE_ERROR': {
      return Object.assign({}, score, { histories: score.histories.concat(action.payload) });
    }
    case 'IM_SCORE':
      return Object.assign({}, score, action.payload,
        window.mm_get_imscore(window.sessionObservable.activeUrl));
    default:
      return score;
  }
};
