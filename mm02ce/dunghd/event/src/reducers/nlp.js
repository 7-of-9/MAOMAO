import { ctxMenuLogin } from './helpers';

const initialState = {
  nlps: [],
  texts: [],
  scores: [],
  terms: [],
  records: [],
};

const MIN_NSS = 10;

export default (nlp = initialState, action, auth) => {
  switch (action.type) {
    case 'LOGOUT_FULFILLED':
      return initialState;
    case 'IM_SAVE_SUCCESS': {
      const url = action.payload.url;
      let score = '';
      const hasExist = nlp.scores.find(item => item.url === url);
      if (hasExist) {
        score = hasExist.score;
      }
      window.setIconApp(url, 'blue', `${score} /`, window.BG_SUCCESS_COLOR);
      return nlp;
    }
    case 'NLP_RESULT': {
        const url = action.payload.url;
        let score = '';
        const hasExist = nlp.scores.find(item => item.url === url);
        if (hasExist) {
          score = hasExist.score;
        }
        window.setIconApp(url, 'blue', `${score} **`, window.BG_SUCCESS_COLOR);
        return nlp;
      }
    case 'NLP_TERMS':
    case 'NLP_INFO_KNOWN': {
        const url = action.payload.url;
        let score = '';
        const hasExist = nlp.scores.find(item => item.url === url);
        if (hasExist) {
          score = hasExist.score;
        }
        window.setIconApp(url, 'blue', `${score}`, window.BG_SUCCESS_COLOR);
        let terms = [];
        if (nlp.terms.length) {
          terms = nlp.terms.filter(item => item.url !== url);
        }
        terms = terms.concat({
          url,
          topics: action.payload.topics,
          suggestions: action.payload.suggestions,
        });
        return Object.assign({}, nlp, { terms });
      }
    case 'NLP_INFO_UNKNOWN': {
        const url = action.payload.url;
        let score = '';
        const hasExist = nlp.scores.find(item => item.url === url);
        if (hasExist) {
          score = hasExist.score;
        }
        window.setIconApp(url, 'black', `${score} *`, window.BG_SUCCESS_COLOR);
        return nlp;
      }
    case 'NLP_INFO_ERROR':
      window.setIconApp(action.payload.url, 'black', '*EX2', window.BG_EXCEPTION_COLOR);
      return nlp;
    case 'API_CALAIS_ERROR':
      window.setIconApp(action.payload.url, 'black', '*EX3', window.BG_EXCEPTION_COLOR);
      return nlp;
    case 'NLP_CALAIS_ERROR':
      window.setIconApp(action.payload.url, 'black', '*EX4', window.BG_EXCEPTION_COLOR);
      return nlp;
    case 'URL_RECORD_ERROR':
      window.setIconApp(action.payload.url, 'black', '*EX3.1', window.BG_EXCEPTION_COLOR);
      return nlp;
    case 'NNS_SCORE': {
        const url = action.payload.url;
        let scores = [];
        if (nlp.scores.length) {
          scores = nlp.scores.filter(item => item.url !== url);
        }

        if (Number(action.payload.score) <= MIN_NSS) {
          window.setIconApp(url, 'black', `!(${Number(action.payload.score)})`, window.BG_ERROR_COLOR);
        } else {
          window.setIconApp(url, 'black', `${Number(action.payload.score)}`, window.BG_SUCCESS_COLOR);
        }

        scores = scores.concat(action.payload);
        return Object.assign({}, nlp, { scores });
      }
    case 'URL_RECORD_SUCCESS': {
        const url = action.payload.url;
        let records = [];
        if (nlp.records.length) {
          records = nlp.records.filter(item => item.url !== url);
        }
        records = records.concat(action.payload);
        ctxMenuLogin(auth.info, records);
        return Object.assign({}, nlp, { records });
      }
    case 'NLP': {
        const url = action.payload.url;
        let nlps = [];
        if (nlp.nlps.length) {
          nlps = nlp.nlps.filter(item => item.url !== url);
        }

        nlps = nlps.concat(action.payload);
        return Object.assign({}, nlp, { nlps });
      }
    case 'TEXT_NOT_ENGLISH': {
        const url = action.payload.url;
        let score = '';
        const hasExist = nlp.scores.find(item => item.url === url);
        if (hasExist) {
          score = hasExist.score;
        }
        window.setIconApp(url, 'black', `${score} !EN`, window.BG_SUCCESS_COLOR);
        return nlp;
      }
    case 'PROCESS_TEXT_RESULT': {
        const url = action.payload.url;
        let texts = [];
        if (nlp.texts.length) {
          texts = nlp.texts.filter(item => item.url !== url);
        }

        if (!action.payload.status) {
          let score = '';
          const hasExist = nlp.scores.find(item => item.url === url);
          if (hasExist) {
            score = hasExist.score;
          }
          window.setIconApp(url, 'black', `${score} !T`, window.BG_SUCCESS_COLOR);
        }

        texts = texts.concat(action.payload);
        return Object.assign({}, nlp, { texts });
      }
    default:
      return nlp;
  }
};
