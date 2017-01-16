const initialState = {
  nlps: [],
  justexts: [],
};

export default (nlp = initialState, action) => {
  switch (action.type) {
    case 'NLP': {
      const url = action.payload.url;
      let nlps = [];
      if (nlp.nlps.length) {
        nlps = nlp.nlps.filter(item => item.url !== url);
      }
      nlps = nlps.concat(action.payload);
      return Object.assign({}, nlp, { nlps });
    }
    case 'JUSTEXT': {
      const url = action.payload.url;
      let justexts = [];
      if (nlp.justexts.length) {
        justexts = nlp.justexts.filter(item => item.url !== url);
      }
      justexts = justexts.concat(action.payload);
      return Object.assign({}, nlp, { justexts });
    }
    default:
      return nlp;
  }
};
