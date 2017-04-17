import axios from 'axios';
import Config from './config';

const config = new Config();

export function shareAll(userId, userHash) {
  return axios({
    method: 'put',
    url: `${config.apiUrl}/share/create?user_id=${userId}&hash=${userHash}&share_all=true`,
  });
}

export function shareThisSite(userId, userHash, urlId) {
  return axios({
    method: 'put',
    url: `${config.apiUrl}/share/create?user_id=${userId}&hash=${userHash}&url_id=${urlId}`,
  });
}

export function shareTheTopic(userId, userHash, topicId) {
  return axios({
    method: 'put',
    url: `${config.apiUrl}/share/create?user_id=${userId}&hash=${userHash}&topic_id=${topicId}`,
  });
}

export function fbScrapeShareUrl(code) {
  // https://graph.facebook.com?scrape=true&id=http://www.maomao.rocks/
  return axios({
    method: 'post',
    url: `https://graph.facebook.com?scrape=true&id=${config.siteUrl}/${code}`,
  });
}
