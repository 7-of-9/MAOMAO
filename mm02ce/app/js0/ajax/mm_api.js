//////////////////////////////////////////////////////
// AJAX / API CALLS
//

var api_base = 'https://mmapi00.azurewebsites.net/';

var ajax_style_hi = 'background: blue; color: white;';
var ajax_style = 'background: white; color: blue;';
var ajax_style_err = 'background: red; color: white;';

/**
 * api/allowable -- get
 *
 * @param string tld
 * @param function successFn
 * @param function errorFn
 */
function ajax_isTldAllowable(tld, successFn, errorFn) {
  var domain = null;
  try {
    domain = new URL(tld).hostname;
  } catch (err) { console.log('%c /allowable, BAD TLD: [' + tld + '] - ' + err, ajax_style_err); }

  if (domain != null) {
    $.ajax({
      type: 'GET',
      url: api_base + 'info/allowable?tld=' + domain,
      success: successFn,
      error: errorFn,
    });
  }
}

/**
 * api/url_nlpinfo -- get
 *
 * @param string url
 * @param function successFn
 * @param function errorFn
 */
function ajax_get_UrlNlpInfo(url, successFn, errorFn) {
  var parsed_url = null;
  try {
    parsed_url = new URL(url);
  } catch (err) { console.log('%c /info/get?url, BAD URL: [' + url + '] - ' + err, ajax_style_err); }
  url = remove_hash_url(url);
  if (parsed_url != null) {
    $.ajax({
      type: 'GET',
      url: api_base + 'info/get?url=' + url,
      success: successFn,
      error: errorFn,
    });
  }
}

/**
 * Record URL
 * @param  number user_id user id
 * @param  string hash  md5hash for google id or facebook id
 * @param  object url_info  [description]
 * @param  function successFn [description]
 * @param  function errorFn   [description]
 */
function ajax_put_UrlRecord(user_id, hash, url_info, successFn, errorFn) {
  console.warn('ajax_put_UrlRecord', url_info);
  $.ajax(api_base + 'url/record?user_id=' + user_id + '&hash=' + hash, {
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(url_info),
    processData: false,
    dataType: 'json',
    success: successFn,
    error: errorFn,
  });
}

/**
 * api/url_nlpinfo_calais -- put
 *
 * @param string nlp_info
 * @param function callback_success
 * @param function errorFn
 */
function ajax_put_UrlNlpInfoCalais(nlp_info, successFn, errorFn) {

  // DUNG*** pass the NLP text to the server (2)
  // --> tell me when you're ready, i'll add the DB tables and url_nlpinfo_calais server.

  $.ajax(api_base + 'url/process', {
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(nlp_info),
    processData: false,
    dataType: 'json',
    success: successFn,
    error: errorFn,
  });

}

/**
 * api/url_history -- put
 * Tracking im_score for each url by user
 * @param {userId: number, url: string, score: number } history
 * @param {function} callback_success
 */
function ajax_put_UrlHistory(history, errorFn, successFn) {
  $.ajax(api_base + '/url/history', {
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(history),
    processData: false,
    dataType: 'json',
    error: errorFn,
    success: successFn,
  });
}

function remove_hash_url(url) { // remove trailing page anchor # from URL
  var url_ex_hash = url;
  var hash_ndx = url_ex_hash.indexOf('#');
  if (hash_ndx != -1)
    url_ex_hash = url_ex_hash.substring(0, hash_ndx);
  return url_ex_hash;
}
