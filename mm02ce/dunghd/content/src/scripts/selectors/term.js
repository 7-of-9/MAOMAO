import moment from 'moment';
import { createSelector } from 'reselect';
import removeHashOnUrl from '../components/utils/url';

const getActiveUrl = () => removeHashOnUrl(window.location.href);
const getTerms = state => state.nlp.terms;
const getTimers = state => state.icon.xpTimers;

const getCurrentTerms = createSelector(
  [getActiveUrl, getTerms],
  (url, terms) => {
    const xp = [];
    if (terms.length) {
      const term = terms.filter(item => item.url === url);
      if (term[0] && term[0].topics) {
        term[0].topics.forEach((topic) => {
          const text = topic.term_name;
          // FIXME: Fake score base on text length, we need to improve later on
          xp.push({
            text,
            score: text.length,
          });
        });
      }
    }
    return xp;
  },
);

const getCurrentXPTopics = createSelector(
  [getActiveUrl, getTerms, getTimers],
  (url, terms, timers) => {
    const xp = [];
    if (terms.length) {
      const term = terms.filter(item => item.url === url);
      const foundTimer = timers.find(item => item.url === url);
      if (foundTimer) {
        if (moment().isAfter(foundTimer.timer)) {
          if (term[0] && term[0].topics) {
            term[0].topics.forEach((topic) => {
              const text = topic.term_name;
              // FIXME: Fake score base on text length, we need to improve later on
              xp.push({
                text,
                score: text.length,
              });
            });
          }
        }
      } else if (term[0] && term[0].topics) {
        term[0].topics.forEach((topic) => {
          const text = topic.term_name;
          // FIXME: Fake score base on text length, we need to improve later on
          xp.push({
            text,
            score: text.length,
          });
        });
      }
    }
    return xp;
  },
);

export { getCurrentTerms, getCurrentXPTopics };
