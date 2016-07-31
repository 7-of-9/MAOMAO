//
// Background poller: for polling audible status of tabs
//

var ping_interval_secs = 3;

$(document).ready(function () {

    var poll_loop = setInterval(function() {
        //console.warn("poll_loop");

        chrome.tabs.query({ audible: true }, function(tabs) {
            if (chrome.runtime.lastError)
                console.warn("CHROME ERR ON CALLBACK -- " + chrome.runtime.lastError.message);
            else {
                _.each(tabs, function(a) {
                    var session = session_get_by_tab(a, false);
                    if (session != null) {
                        session_inc_audible_pings(session);
                        console.warn(" >> audible: [" + session.url + "] est_audible_time=" + session.est_audible_time() + " sec(s) sid=" + session.sid);
                    }
                });
            }
        });

    }, ping_interval_secs * 1000);

});