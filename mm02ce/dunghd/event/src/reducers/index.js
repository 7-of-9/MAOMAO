import { combineReducers } from 'redux';
import auth from './auth';
import modal from './modal';
import score from './score';

export default combineReducers({
  auth, modal, score,
});
