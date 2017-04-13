import { call, put, select } from 'redux-saga/effects'
import queryString from 'query-string'

import request from '../../utils/request'
import { LIMIT, GOOGLE_API_KEY } from '../../containers/App/constants'
import { youtubeLoaded, youtubeLoadingError } from '../../containers/App/actions'
import { makeSelectYoutube } from '../../containers/App/selectors'
import { makeSelectTerms } from '../../containers/Discovery/selectors'

/**
 * Google Youtube request/response handler
 */
export function * getYoutubeVideo () {
  // Select terms from store
  const terms = yield select(makeSelectTerms())
  const keyword = terms.join(' ')
  if (keyword === '') {
    yield put(youtubeLoaded({ nextPageToken: '', youtubeVideos: [] }, terms))
  } else {
    const youtubeState = yield select(makeSelectYoutube())
    const pageToken = youtubeState.get('nextPageToken') || ''
    // Youtube API support those types: video, channel and playlist
    // For testing purpose, we will get only video
    const buildQuery = queryString.stringify({
      q: keyword,
      key: GOOGLE_API_KEY,
      maxResults: LIMIT,
      part: 'snippet',
      type: 'video',
      pageToken
    })
    const requestURL = `https://www.googleapis.com/youtube/v3/search?${buildQuery}`

    try {
      const result = yield call(request, requestURL)
      yield put(youtubeLoaded({ nextPageToken: result.nextPageToken, youtubeVideos: result.items || [] }, terms))
    } catch (err) {
      yield put(youtubeLoadingError(err))
    }
  }
}
