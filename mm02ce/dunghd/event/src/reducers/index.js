import auth from './auth';
import modal from './modal';
import score from './score';
import nlp from './nlp';
import icon from './icon';

export default function reducer(state = {}, action) {
    return {
        auth: auth(state.auth, action),
        modal: modal(state.modal, action),
        score: score(state.score, action),
        nlp: nlp(state.nlp, action),
        icon: icon(state.icon, action, state.auth),
    };
}
