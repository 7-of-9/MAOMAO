//
// Data: browsing data & history (local storage)
//
var MAX_SESSION_ITEMS = 5;
var mm;
var mm_logstyle_hi = "background: purple; color: white";
var mm_logstyle_semi_hi = "background: white; color: purple; font-weight:bold;";
var mm_logstyle = "background: white; color: purple";
var mm_logstyle_err = "background: red; color: white";
var mm_dirty = false;
var mm_last_save_at = 0;

// http://jsonviewer.stack.hu/

//
// get/load from chrome.storage.local
//
function mm_load() {
    mm = { all_sessions: [], last_save_at: 0 };
    console.info("%c mm_load - NOP", mm_logstyle, mm);
}

//
// add/update to chrome.storage.local
//
function mm_update(session, force) {
    console.info("%c mm_update - NOP", mm_logstyle, session, force);
    if (session && session.url) {
        var data = Object.assign({}, {
            sid: session.sid,
            im_score: session.im_score,
            audible_pings: session.audible_pings,
            time_on_tab: session.TOT_total_millis,
            url: session.url,
        });
        var existSession = sessionObservable.urls.get(session.url);
        if (existSession) {
            if (Number(data.im_score) > Number(existSession.im_score)) {
                existSession.im_score = data.im_score;
            }

            if (data.audible_pings > existSession.audible_pings) {
                existSession.audible_pings = data.audible_pings;
            }

            if (data.time_on_tab !== existSession.time_on_tab) {
                existSession.time_on_tab = data.time_on_tab;
            }

            if (data.url !== existSession.url) {
                existSession.url = data.url;
            }

        } else {
            sessionObservable.urls.set(session.url, data);
        }
    }
}

/**
 * Clean mm.all_sessions when it reach to MAX_SESSION_ITEMS
 *
 */
function mm_session_clean() {
    if (mm.all_sessions && mm.all_sessions.length > MAX_SESSION_ITEMS) {
        console.warn('It reachs to max items on session', MAX_SESSION_ITEMS);
        var exist_urls = _.map(tabmap, function(tab) { return tab.url; });
        var existing_sessions = _.filter(mm.all_sessions, function(session) { return _.contains(exist_urls, session.url); });
        mm = Object.assign({}, mm, { all_sessions: existing_sessions });
    }
}