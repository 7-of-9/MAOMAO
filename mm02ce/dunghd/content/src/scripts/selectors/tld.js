import { createSelector } from 'reselect';

const getTerms = state => state.nlp.terms;
const getActiveUrl = state => state.score.url;

const getCurrentTLD = createSelector(
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

export default getCurrentTLD;
