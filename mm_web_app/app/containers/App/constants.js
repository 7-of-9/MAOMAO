/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */
export const LIMIT = 10;
export const CRALWER_API_URL = 'https://dunghd.stdlib.com/crawler@dev/';
export const MAOMAO_API_URL = 'https://mmapi00.azurewebsites.net/api/';
export const DEFAULT_LOCALE = 'en';
export const GOOGLE_API_KEY = 'AIzaSyDa9LV6fTUGRvFYki0GLSS2NzNP-CylMEI';
export const GOOGLE_CUSTOM_SEARCH_API_KEY = 'AIzaSyCj_iIAID29ZTZG7HQv8TxivT99x7QYeG4';
export const FACEBOOK_APP_ID = '386694335037120';
export const FACEBOOK_APP_SECRET = 'cdb6d9303e1aa575a70857861d663fe1';
export const INSTAGRAM_CLIENT_ID = '77c4c8922e774b58bf101dc9f5c665e2';
export const IMGUR_CLIENT_ID = '9d21f2c0aab0ca7';
export const IMGUR_CLIENT_SECRET = '31b69276f1041518d2dd3e9488b9ce2b618efba8';
export const REDDIT_CLIENT_ID = 'CuFq5x8GtBDLuA';
export const REDDIT_CLIENT_SECRET = '0KaZNPLLIzlGt3qckbgL77YZ-44';

export const SWITCH_USER = 'app/App/SWITCH_USER';
export const CLEAN_SEARCH_RESULT = 'app/App/CLEAN_SEARCH_RESULT';
export const USER_HISTORY = 'app/App/USER_HISTORY';
export const USER_HISTORY_SUCCESS = 'app/App/USER_HISTORY_SUCCESS';
export const USER_HISTORY_ERROR = 'app/App/USER_HISTORY_ERROR';
export const GOOGLE_SEARCH = 'app/App/GOOGLE_SEARCH';
export const GOOGLE_SEARCH_SUCCESS = 'app/App/GOOGLE_SEARCH_SUCCESS';
export const GOOGLE_SEARCH_ERROR = 'app/App/GOOGLE_SEARCH_ERROR';
export const GOOGLE_CONNECT = 'app/App/GOOGLE_CONNECT';
export const GOOGLE_CONNECT_SUCCESS = 'app/App/GOOGLE_CONNECT_SUCCESS';
export const GOOGLE_CONNECT_ERROR = 'app/App/GOOGLE_CONNECT_ERROR';
export const GOOGLE_NEWS_SEARCH = 'app/App/GOOGLE_NEWS_SEARCH';
export const GOOGLE_NEWS_SEARCH_SUCCESS = 'app/App/GOOGLE_NEWS_SEARCH_SUCCESS';
export const GOOGLE_NEWS_SEARCH_ERROR = 'app/App/GOOGLE_NEWS_SEARCH_ERROR';
export const GOOGLE_KNOWLEDGE_SEARCH = 'app/App/GOOGLE_KNOWLEDGE_SEARCH';
export const GOOGLE_KNOWLEDGE_SEARCH_SUCCESS = 'app/App/GOOGLE_KNOWLEDGE_SEARCH_SUCCESS';
export const GOOGLE_KNOWLEDGE_SEARCH_ERROR = 'app/App/GOOGLE_KNOWLEDGE_SEARCH_ERROR';
export const YOUTUBE_SEARCH = 'app/App/YOUTUBE_SEARCH';
export const YOUTUBE_SEARCH_SUCCESS = 'app/App/YOUTUBE_SEARCH_SUCCESS';
export const YOUTUBE_SEARCH_ERROR = 'app/App/YOUTUBE_SEARCH_ERROR';
export const REDDIT_SEARCH = 'app/App/REDDIT_SEARCH';
export const REDDIT_SEARCH_SUCCESS = 'app/App/REDDIT_SEARCH_SUCCESS';
export const REDDIT_SEARCH_ERROR = 'app/App/REDDIT_SEARCH_ERROR';
export const IMGUR_SEARCH = 'app/App/IMGUR_SEARCH';
export const FACEBOOK_SEARCH = 'app/App/FACEBOOK_SEARCH';
export const INSTAGRAM_SEARCH = 'app/App/INSTAGRAM_SEARCH';
