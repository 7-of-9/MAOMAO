import { combineReducers } from 'redux';
import auth from './auth';
import modal from './modal';
import score from './score';
import nlp from './nlp';

export default combineReducers({
  auth, modal, score, nlp,
});
