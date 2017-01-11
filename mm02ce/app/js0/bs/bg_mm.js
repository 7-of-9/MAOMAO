//
// Data: browsing data & history (local storage)
//

var mm;
var mm_logstyle_hi = "background: purple; color: white";
var mm_logstyle_semi_hi = "background: white; color: purple; font-weight:bold;";
var mm_logstyle = "background: white; color: purple";
var mm_logstyle_err = "background: red; color: white";
var mm_dirty = false;
var mm_last_save_at = 0;

// TODO: Observe change for mm
var sessionObservable = mobx.observable({
  urls: mobx.asMap({}),
  activeUrl: '',
  updateAt: Date.now(),
});

mobx.autorun(function autorun_onChange_im_score() {
  console.info('autorun sessionObservable:' + sessionObservable.urls);
  mm_save_imscore();
});

/**
 * Save im_score to api server
 */
function mm_save_imscore() {
  var url = sessionObservable.activeUrl;
  var score = sessionObservable.urls.get(url);
  if (score && score.im_score) {
    sessionObservable.updateAt = Date.now();
    console.info('autorun sessionObservable - READY to send user', url, score);
  }
}

/**
 * get im_score base url
 */
function mm_get_imscore(url) {
  var score = sessionObservable.urls.get(url);
  var result = {
    im_score: 0,
    audible_pings: 0,
    time_on_tabs: 0,
    url: url,
  };
  if (score) {
    result = {
      im_score: score.im_score,
      audible_pings: score.audible_pings,
      time_on_tabs: score.time_on_tabs,
      url: score.url,
    }
  }
  console.info('mm_get_imscore', result);
  return result;
}


// http://jsonviewer.stack.hu/

//
// get/load from chrome.storage.local
//
function mm_load() {
  mm = { all_sessions: [], last_save_at: 0 }; // don't get from local storage
  console.info("%c mm_load - NOP", mm_logstyle, mm);

  /*chrome.storage.local.get(null, function (items) {
      mm = items;
      if (!mm.hasOwnProperty("all_sessions")) mm.all_sessions = [];
      if (!mm.hasOwnProperty("last_save_at")) mm.last_save_at = 0;
      console.info("%c mm_load > last_save_at = " + (new Date(mm.last_save_at).toString()), mm_logstyle_hi);

      // remove null sessions
      mm.all_sessions = _.filter(mm.all_sessions, function (a) { return a != null });

      _.each(mm.all_sessions, function(a) {
          // set session & session meta accessors
          set_session_accessors(a);
          set_meta_accessors(a.page_meta);

          // force re-inject full CS on new instances
          a.injected_cs_timestamp = null;

          // setup time on tab
          a.TOT_cur_start_at = 0;
          a.TOT_cur_stop_at = 0;
      });

      // dbg -- sort by URL & validate
      mm_dbg_cleanup();

      // sort by most recent view
      mm.all_sessions = _.sortBy(mm.all_sessions, function (a) {
          return a.view_timestamps != null ? a.view_timestamps[a.view_timestamps.length - 1] : 0;
      }).reverse();

      // info / setup
      _.each(mm.all_sessions, function (a) {
          //if (!a.hasOwnProperty("sid") || typeof a.sid == "undefined" || a.sid == null)
          //    a.sid = new_guid();

          //if (!a.hasOwnProperty("audible_pings") || typeof a.audible_pings == "undefined" || a.audible_pings == null)
          //    a.audible_pings = 0;
          var tags = "";
          _.each(a.tags, function(b) { tags += "(" + b.tag + ": " + b.score + ") "; });

          console.info("  ");
          console.info("%c ... mm_load .... session [" + a.url + "]", mm_logstyle_semi_hi);
          console.info("%c                  page_meta.image = " + a.page_meta.image(), mm_logstyle);
          console.info("%c                  page_meta.title = " + a.page_meta.title(), mm_logstyle);
          console.dir(a.page_meta);
          console.info("%c                  sid = " + a.sid, mm_logstyle);
          console.info("%c                  im_score = " + a.im_score, mm_logstyle);
          console.info("%c                  topic_specific = [" + a.topic_specific + "]", mm_logstyle);
          console.info("%c " + tags, mm_logstyle);
          console.info("%c                  nlps.length = [" + a.nlps.length + "]", mm_logstyle);
          console.dir(a.nlps);
          console.info("%c                  a.est_time_on_tab = " + a.est_time_on_tab() + " sec(s)", mm_logstyle);
          console.info("%c                  a.est_audible_time = " + a.est_audible_time() + " sec(s)", mm_logstyle);

          if (a.view_timestamps != null && a.view_timestamps.length > 0) {
              var earliest_view = a.view_timestamps[0];
              var latest_view = a.view_timestamps[a.view_timestamps.length - 1];
              var view_range_millis = latest_view - earliest_view;
              var view_range_hours = (view_range_millis / 1000 / 60 / 60).toFixed(4);
              console.info("%c                  " + a.view_timestamps.length + " view(s) over " +
                           view_range_hours + " hour(s), last viewed " + moment(new Date(latest_view)).fromNow(), mm_logstyle);
          }
          else
              console.info("%c                  NO VIEWS!!", mm_logstyle_err);

          if (a.events != null && a.events.length > 0)
              console.info("%c                  " + a.events.length + " events(s)", mm_logstyle);
          else
              console.info("%c                  NO EVENTS!!", mm_logstyle_err);

      });

      console.info("%c mm_load -- GOT! mm.all_sessions.length = " + mm.all_sessions.length, mm_logstyle_hi);
      mm_dirty = false;
  });

  chrome.storage.local.getBytesInUse(null, function (b) {
      console.info("%c mm_load -- chrome.storage.local use = " + (b / 1024).toFixed(2) + " KB", mm_logstyle_hi);
  });*/
}

//
// add/update to chrome.storage.local
//
function mm_update(session, force) {
  console.info("%c mm_update - NOP", mm_logstyle, session, force);
  if (session && session.url) {
    // TODO: Save NLP data
    var data = Object.assign({},
      {
        sid: session.sid,
        im_score: session.im_score,
        audible_pings: session.audible_pings,
        time_on_tabs: session.TOT_total_millis,
        url: session.url,
      });
    var existSession = sessionObservable.urls.get(session.url);
    if (existSession) {
      // TODO: Change im_score when the change > 1.0
      if (Number(data.im_score) > Number(existSession.im_score + 1)) {
        existSession.im_score = data.im_score;
      }

      if (data.audible_pings > existSession.audible_pings) {
        existSession.audible_pings = data.audible_pings;
      }

      if (data.time_on_tabs !== existSession.time_on_tabs) {
        existSession.time_on_tabs = data.time_on_tabs;
      }

      if (data.url !== existSession.url) {
        existSession.url = data.url;
      }

    } else {
      sessionObservable.urls.set(session.url, data);
    }
  }

  /*if (session == null) {
      console.error("%c ### mm_update -- PASSED NULL SESSION!", mm_logstyle_err);
      return;
  }

  var known_sessions = _.filter(mm.all_sessions, function (a) { return a.url == session.url });
  if (known_sessions.length == 1) {
      ;
      //console.info("%c >> mm_update -- known session; NOP. [" + session.url + "]", mm_logstyle);
  }
  else if (known_sessions.length == 0)
  {
      console.info("%c >> mm_update -- new session (ADD) [" + session.url + "]", mm_logstyle_hi);
      mm.all_sessions.push(session);
  }
  else
      console.error("%c ### mm_update -- more than one known session! [" + session.url + "]", mm_logstyle_err);

  mm_dirty = true;
  mm_save(force);*/
}

//
// naive save all - no deltas, no syncing
//
function mm_save(force) {
  console.info("%c mm_save - NOP", mm_logstyle, force);

  /*
  if (!mm_dirty) {
      console.info("%c mm_save (" + (force ? "HARD" : "soft") + ") -- ignoring: not dirty.", mm_logstyle);
      return;
  }

  var should_save = force == true ? true : false;
  if (force)
      console.info("%c mm_save -- HARD SAVE", mm_logstyle_hi);

  var since_last_save = Date.now() - mm_last_save_at;
  if (!force && since_last_save > 1000 * 60) {
      console.info("%c mm_save -- soft save, upgraded to hard save; since_last_save=" + since_last_save, mm_logstyle_hi);
      should_save = true;
  } else {
      console.info("%c mm_save -- soft save; ignoring (" + mm.all_sessions.length + " session(s)) - since_last_save=" + since_last_save, mm_logstyle);
  }

  if (should_save) {
      // remove sessions without NLP data -- not useful
      mm.all_sessions = _.filter(mm.all_sessions, function (a) { return a.hasOwnProperty("nlps"); });

      console.dir(mm.all_sessions);

      mm.last_save_at = Date.now();
      chrome.storage.local.set(mm, function() {
          console.time("mm_save");
          console.info("%c mm_save -- SAVED! mm.all_sessions.length = " + mm.all_sessions.length, mm_logstyle_hi);
          console.timeEnd("mm_save");
          mm_last_save_at = Date.now();
          mm_dirty = false;
      });
  }*/
}

function mm_dbg_cleanup() {

  // (dbg cleanup) dedupe (sorted up to n-1, look next)
  mm.all_sessions = _.sortBy(mm.all_sessions, function (a) { return a.url });
  for (var i = 0; i < mm.all_sessions.length - 1; i++) {
    if (mm.all_sessions[i].url == mm.all_sessions[i + 1].url) {
      console.error("%c ### mm_load -- got dupe session [" + mm.all_sessions[i].url + "]", mm_logstyle_err);
      mm.all_sessions.splice(i, 1); // remove 1 in place
      i--;
      mm_dirty = true;
    }
  }

  for (var i = 0; i < mm.all_sessions.length; i++) {
    var a = mm.all_sessions[i];
    if (a.page_meta == null
      || !process_url(a.url)
      || typeof a.sid == "undefined"
      || typeof a.im_score == "undefined"
      || a.page_meta.image() == null
      || a.nlps == null || a.topic_specific == "?"
    ) {
      console.error("%c ### mm_load -- removing bad data session [" + a.url + "]", mm_logstyle_err);
      mm.all_sessions.splice(i, 1);
      i--;
      mm_dirty = true;
    }
  }
  mm_save(true);
}
