import axios from 'axios'
const apiUrl = 'https://mmapi00.azurewebsites.net'

export function shareAll (userId, userHash) {
  return axios({
    method: 'put',
    url: `${apiUrl}/share/create?user_id=${userId}&hash=${userHash}&share_all=true`
  })
}

export function shareThisSite (userId, userHash, urlId) {
  return axios({
    method: 'put',
    url: `${apiUrl}/share/create?user_id=${userId}&hash=${userHash}&url_id=${urlId}`
  })
}

export function shareTheTopic (userId, userHash, topicId) {
  return axios({
    method: 'put',
    url: `${apiUrl}/share/create?user_id=${userId}&hash=${userHash}&topic_id=${topicId}`
  })
}
