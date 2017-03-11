/*
 * AppReducer
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 */

import { fromJS } from 'immutable';
import { userId, userEmail } from 'utils/simpleAuth';
import {
  SWITCH_USER,
  CLEAN_SEARCH_RESULT,
  GOOGLE_CONNECT,
  GOOGLE_CONNECT_ERROR,
  GOOGLE_CONNECT_SUCCESS,
  USER_HISTORY,
  USER_HISTORY_ERROR,
  USER_HISTORY_SUCCESS,
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_NEWS_SEARCH,
  GOOGLE_NEWS_SEARCH_ERROR,
  GOOGLE_NEWS_SEARCH_SUCCESS,
  GOOGLE_KNOWLEDGE_SEARCH,
  GOOGLE_KNOWLEDGE_SEARCH_ERROR,
  GOOGLE_KNOWLEDGE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_ERROR,
  YOUTUBE_SEARCH_SUCCESS,
  REDDIT_SEARCH,
  REDDIT_SEARCH_ERROR,
  REDDIT_SEARCH_SUCCESS,
} from './constants';

const initialUserHistoryState = fromJS({
  topics: [],
  urls: [],
});

const initialGoogleConnectState = fromJS({
  googleResponse: {},
  user: {
    id: userId(),
    email: userEmail(),
  },
});

const initialGoogleState = fromJS({
  googleSearchResult: [],
});
const initialGoogleNewsState = fromJS({
  googleNews: [],
});
const initialGoogleKnowledgeState = fromJS({
  googleKnowledges: [],
});
const initialYoutubeState = fromJS({
  nextPageToken: '',
  youtubeVideos: [],
});
const initialRedditState = fromJS({
  redditListing: [],
});

// The initial state of the App
const initialState = fromJS({
  loading: {
    isGoogleLoading: false,
    isGoogleConnectLoading: false,
    isGoogleNewsLoading: false,
    isGoogleKnowledgeLoading: false,
    isUserHistoryLoading: false,
    isYoutubeLoading: false,
    isReadingLoading: false,
  },
  error: [],
  data: {
    google: initialGoogleState,
    googleConnect: initialGoogleConnectState,
    news: initialGoogleNewsState,
    knowledge: initialGoogleKnowledgeState,
    youtube: initialYoutubeState,
    reddit: initialRedditState,
    userHistory: initialUserHistoryState,
  },

});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case GOOGLE_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => true);
    case GOOGLE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['data', 'google', 'googleSearchResult'], (items) => items.push(...action.data));
    case GOOGLE_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case SWITCH_USER:
      return state
        .updateIn(['data', 'googleConnect', 'user', 'id'], () => action.data);
    case USER_HISTORY:
      return state
        .updateIn(['loading', 'isUserHistoryLoading'], () => true);
    case USER_HISTORY_SUCCESS:
      return state
        .updateIn(['loading', 'isUserHistoryLoading'], () => false)
        .updateIn(['data', 'userHistory'], () => fromJS(action.data));
    case USER_HISTORY_ERROR:
      return state
        .updateIn(['loading', 'isUserHistoryLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case GOOGLE_CONNECT:
      return state
        .updateIn(['loading', 'isGoogleConnectLoading'], () => true)
        .updateIn(['data', 'googleConnect', 'googleResponse'], () => fromJS(action.data));
    case GOOGLE_CONNECT_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleConnectLoading'], () => false)
        .updateIn(['data', 'googleConnect', 'user'], () => fromJS(action.data));
    case GOOGLE_CONNECT_ERROR:
      return state
        .updateIn(['loading', 'isGoogleConnectLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case GOOGLE_KNOWLEDGE_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => true);
    case GOOGLE_KNOWLEDGE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['data', 'knowledge', 'googleKnowledges'], (items) => items.push(...action.data));
    case GOOGLE_KNOWLEDGE_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case GOOGLE_NEWS_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => true);
    case GOOGLE_NEWS_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => false)
        .updateIn(['data', 'news', 'googleNews'], (items) => items.push(...action.data));
    case GOOGLE_NEWS_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case REDDIT_SEARCH:
      return state
        .updateIn(['loading', 'isReadingLoading'], () => true);
    case REDDIT_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isReadingLoading'], () => false)
        .updateIn(['data', 'reddit', 'redditListing'], (items) => items.push(...action.data));
    case REDDIT_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isReadingLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case YOUTUBE_SEARCH:
      return state.updateIn(['loading', 'isYoutubeLoading'], () => true);
    case YOUTUBE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isYoutubeLoading'], () => false)
        .updateIn(['data', 'youtube', 'nextPageToken'], () => action.data.nextPageToken)
        .updateIn(['data', 'youtube', 'youtubeVideos'], (items) => items.push(...action.data.youtubeVideos));
    case YOUTUBE_SEARCH_ERROR:
      return state
      .updateIn(['loading', 'isYoutubeLoading'], () => false)
      .updateIn(['error'], (error) => error.push(action.error));
    case CLEAN_SEARCH_RESULT:
      return state.updateIn(['data', 'google'], () => initialGoogleState)
       .updateIn(['data', 'knowledge'], () => initialGoogleKnowledgeState)
       .updateIn(['data', 'news'], () => initialGoogleNewsState)
       .updateIn(['data', 'youtube'], () => initialYoutubeState)
       .updateIn(['data', 'reddit'], () => initialRedditState);
    default:
      return state;
  }
}

export default appReducer;
