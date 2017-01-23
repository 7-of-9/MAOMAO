const initialState = {
    nlps: [],
    justexts: [],
    scores: [],
};

export default (nlp = initialState, action) => {
    switch (action.type) {
        case 'NLP_INFO_ERROR':
            window.setIconApp('black', '*EX2', '#999999');
            return nlp;
        case 'NLP_SCORE': {
            const url = action.payload.url;
            let scores = [];
            if (nlp.scores.length) {
                scores = nlp.scores.filter(item => item.url !== url);
            }

            scores = scores.concat(action.payload);
            return Object.assign({}, nlp, { scores });
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
        case 'JUSTEXT_IS_READY': {
            const url = action.payload.url;
            let status = false;
            if (nlp.justexts.length) {
                const justext = nlp.justexts.find(item => item.url === url);
                if (justext) {
                    status = justext.status;
                }
            }

            let score = 'N/A';
            if (nlp.scores.length) {
                const hasScore = nlp.scores.find(item => item.url === url);
                if (hasScore) {
                    score = hasScore.score;
                }
            }

            // TODO: remove window.setIconForNLP(status, `${status ? 'ok' : '!jt'}:${score}`);
            return nlp;
        }
        case 'JUSTEXT': {
            const url = action.payload.url;
            let score = 'N/A';
            if (nlp.scores.length) {
                const hasScore = nlp.scores.find(item => item.url === url);
                if (hasScore) {
                    score = hasScore.score;
                }
            }

            // TOOD: remove window.setIconForNLP(status, `${action.payload.status ? 'ok' : '!jt'}:${score}`);
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
