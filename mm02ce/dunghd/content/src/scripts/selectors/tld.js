import moment from 'moment';
import { createSelector } from 'reselect';
import * as logger from 'loglevel';

const getRecords = state => state.nlp.records;
const getTimers = state => state.icon.tldTimers;
const getActiveUrl = state => state.score.url;

const getCurrentTLD = createSelector(
  [getActiveUrl, getRecords, getTimers],
  (url, records, timers) => {
    const xp = [];
    if (records.length) {
      const term = records.find(item => item.url === url);
      if (term && term.data && term.data.tld_topic) {
        // check timer
        const foundTimer = timers.find(item => item.tld === term.data.tld_topic);
        if (foundTimer) {
          if (moment().isAfter(foundTimer.timer)) {
            xp.push({
              text: foundTimer.tld,
              score: foundTimer.tld.length,
            });
          }
        } else {
          xp.push({
            text: term.data.tld_topic,
            score: term.data.tld_topic.length,
          });
        }
      }
    }
    return xp;
  },
);

export default getCurrentTLD;
