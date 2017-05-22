import logger from './logger';
// tracking latest record for by url
const histories = {};
logger.info('histories', histories);
/**
 * get im_score base url
 */
export function getImScore(sessionObservable, rawUrl) {
  const url = window.bglib_remove_hash_url(rawUrl);
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
export function saveImScore(sessionObservable, apiSaveImScore, store, rawUrl, userId, hash) {
  const now = new Date().toISOString();
  const url = window.bglib_remove_hash_url(rawUrl);
  const data = Object.assign({}, getImScore(sessionObservable, url));
  logger.info('saveImScore url', url);
  // find which changes from last time
  const lastRecord = histories[url];
  if (lastRecord) {
    logger.info('saveImScore lastRecord', lastRecord);
    data.im_score -= Number(lastRecord.im_score);
    data.audible_pings -= Number(lastRecord.audible_pings);
    data.time_on_tab -= Number(lastRecord.time_on_tab);
  }

  // fix time_on_tab is null
  if (isNaN(parseFloat(data.time_on_tab))) {
    data.time_on_tab = 0;
  }

  const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
  if (urlOnSession && urlOnSession.document_head_hash) {
    data.document_head_hash = urlOnSession.document_head_hash;
    logger.info('saveImScore data', data);
    // Only save when im_score change
    if (Number(data.im_score) > 0 ||
      Number(data.time_on_tab) > 0 ||
      Number(data.audible_pings) > 0) {
      histories[url] = Object.assign({}, getImScore(sessionObservable, url));
      logger.info('saveImScore histories', histories);
      apiSaveImScore(userId, hash, data,
        (error) => {
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
  } else {
    logger.info('not found session for url');
  }
}


/**
 * Check im_score base on active url and update time
 */
export function checkImScore(sessionObservable, batchActions, store, rawUrl, updateAt) {
  // checking current url is allow or not
  const url = window.bglib_remove_hash_url(rawUrl);
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
