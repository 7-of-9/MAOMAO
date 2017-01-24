//////////////////////////////////////////////////////
// AJAX / API CALLS
//

var api_base = //'https://localhost:44384/api'
    'https://mmapi00.azurewebsites.net/api';

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
            url: api_base + '/allowable?tld=' + domain,
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
    } catch (err) { console.log('%c /url_nlpinfo, BAD URL: [' + url + '] - ' + err, ajax_style_err); }

    if (parsed_url != null) {
        $.ajax({
            type: 'GET',
            url: api_base + '/url_nlpinfo?url=' + url,
            success: successFn,
            error: errorFn,
        });
    }
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

    $.ajax(api_base + '/url_nlpinfo_calais', {
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
    $.ajax(api_base + '/url_history', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(history),
        processData: false,
        dataType: 'json',
        error: errorFn,
        success: successFn,
    });
}
