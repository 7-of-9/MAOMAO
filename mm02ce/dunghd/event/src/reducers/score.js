import { getImScore } from '../imscore';

const initialState = {
  im_score: 0,
  audible_pings: 0,
  time_on_tab: 0,
  isOpen: false,
  url: '',
  updateAt: new Date().toISOString(),
  histories: [],
};

export default (score = initialState, action) => {
  switch (action.type) {
    case 'IM_ALLOWABLE':
      return Object.assign({}, score, action.payload);
    case 'IM_SAVE_SUCCESS':
    case 'IM_SAVE_ERROR': {
      const url = action.payload.url;
      let histories = [];
      if (score.histories.length) {
        histories = score.histories.filter(item => item.url !== url);
      }
      histories = histories.concat(action.payload);
      return Object.assign({}, score, { histories });
    }
    case 'IM_SCORE':
      return Object.assign({}, score, action.payload,
        getImScore(window.sessionObservable, action.payload.url));
    default:
      return score;
  }
};
