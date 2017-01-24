// tracking latest record for by url
const histories = {};

/**
 * get im_score base url
 */
export function getImScore(sessionObservable, url) {
  const score = sessionObservable.urls.get(url);
  let result = {
    im_score: 0,
    audible_pings: 0,
    time_on_tab: 0,
    url,
  };
  if (score) {
    result = {
      im_score: score.im_score,
      audible_pings: score.audible_pings,
      time_on_tab: score.time_on_tab,
      url: score.url,
    };
  }
  return result;
}


/**
 * Save im_score and save latest record on for tracking history
 */
export function saveImScore(sessionObservable, apiSaveImScore, store, url, userId) {
  const now = new Date().toISOString();
  const data = Object.assign({}, getImScore(sessionObservable, url), { userId });

  // find which changes from last time
  if (histories[url]) {
    data.im_score -= Number(histories[url].im_score);
    data.audible_pings -= Number(histories[url].audible_pings);
    data.time_on_tab -= Number(histories[url].time_on_tab || 0);
  }

  // fix time_on_tab is null
  if (isNaN(parseFloat(data.time_on_tab))) {
    data.time_on_tab = 0;
  }

  // Only save when im_score change
  if (Number(data.im_score) > 0) {
    apiSaveImScore(data,
      (error) => {
        histories[url] = data;
        store.dispatch({
          type: 'IM_SAVE_ERROR',
          payload: {
            url,
            saveAt: now,
            history: {
              data,
              error,
            },
          },
        });
      },
      (result) => {
        histories[url] = data;
        store.dispatch({
          type: 'IM_SAVE_SUCCESS',
          payload: {
            url,
            saveAt: now,
            history: {
              data,
              result,
            },
          },
        });
      });
  }
}


/**
 * Check im_score base on active url and update time
 */
export function checkImScore(sessionObservable, batchActions, store, url, updateAt) {
  // checking current url is allow or not
  if (sessionObservable.urls.get(url)) {
    store.dispatch(batchActions(
      [
        {
          type: 'IM_SCORE',
          payload: {
            url,
            updateAt,
          },
        },
        {
          type: 'IM_ALLOWABLE',
          payload: {
            url,
            isOpen: true,
          },
        },
      ]));
  } else {
    store.dispatch(batchActions(
      [
        {
          type: 'IM_SCORE',
          payload: {
            url,
            updateAt,
          },
        },
        {
          type: 'IM_ALLOWABLE',
          payload: {
            url,
            isOpen: false,
          },
        },
      ]));
  }
}
