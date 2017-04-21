//////////////////////////////////////////////////////
// SESSION MANAGEMENT
// sessions -> historic (from previous extension runs: pulled from localstorage) +
// sessions -> current (from current extension run: includes sessions that are 'dead', i.e. user killed the tab or nav'd away)
//

// handle authentication
var isGuest = true;
var enableTestYoutube = false;
var enableImscore = true;
var enableExperimentalTopics = true;
var userId = -1;
var userHash = '';
var NotInjectCSUrls = [];
var session_style_hi = 'background: blue; color: white;';
var session_style = 'background: white; color: blue;';
var session_style_err = 'background: red; color: white;';

// new session
function new_session(url) {
  var ret = {
    'url': url,
    'sid': new_guid(),
    'im_score': 0,
    'audible_pings': 0,
  }
  set_session_accessors(ret);
  return ret;

}
// session accessors
function set_session_accessors(a) {
  //delete a.est_audible_time;
  //delete a.est_time_on_tab;
  //delete a.mm_score;
  a.est_audible_time = fn_est_audible_time;
  a.est_time_on_tab = fn_est_time_on_tab;
  a.mm_score = fn_mm_score;
}

function fn_est_audible_time() { return this.audible_pings * ping_interval_secs; }

function fn_est_time_on_tab() { return this.TOT_total_millis / 1000; }

function fn_mm_score() { return 'TODO'; }

// page-meta accessors -- prefer itemprop microdata > og tags > html meta
function set_meta_accessors(meta) {
  if (meta != null) {
    //delete meta.title;
    //delete meta.image;
    meta.title = fn_page_meta_title; // attach accessor (not visible from CS scope)
    meta.image = fn_page_meta_image; // attach accessor (not visible from CS scope)
  }
}

function fn_page_meta_title() { return this.ip_name || this.og_title || this.html_title; };

function fn_page_meta_image() { return this.ip_thumbnail_url || this.og_image; }

//
// gets or creates new session by tab
///   (*) does allowable lookup -- then does CS injection if url is allowable
//
function session_get_by_tab(tab, reinject_cs_handlers_on_existing_session) {
  log.info('%c >>> get_session_by_tab (' + mm.all_sessions.length + ') - url: ' + tab.url, session_style_hi);
  // log.trace('checking session for tab', tab);

  var session = null;
  // turn off for guest
  if (isGuest) {
    return session;
  }
  var url_ex_hash = bglib_remove_hash_url(tab.url);

  var existing_session = _.filter(mm.all_sessions, function (a) { return a.url == url_ex_hash });

  // this does happen! can only assume that it's because this called from multiple threads somehow;
  if (existing_session.length > 1) {
    log.warn('%c ### get_session_by_tab - GOT >1 URL MATCH! shouldn\'t happen.' + mm.all_sessions.length, session_style_err);
    // so, just warn and move on -- the code below will always return the *first* session in the filtered list, so might not be the end of the world
  }

  //
  // existing session - (re)inject CS if allowable and not yet injected
  //
  if (existing_session.length >= 1) {

    log.info('%c (get_session - existing: ' + tab.url + ') reinject_cs_handlers_on_existing_session=' + reinject_cs_handlers_on_existing_session, 'color: gray; ');
    session = existing_session[0];

    // inject CS into known session, if not already done
    var session_injected_cs = session.hasOwnProperty('injected_cs_timestamp') && session.injected_cs_timestamp != null;
    if (!session_injected_cs) { // never injected

      // only inject CS if the TLD is allowable
      ajax_isTldAllowable(url_ex_hash, function (data) {
        log.info('%c /allowable... got: ' + JSON.stringify(data), ajax_style_hi);

        if (data.allowable) {

          log.info('%c >>> get_session_by_tab - existing - never injected & allowable [' + url_ex_hash + '] >> injecting (again) ...', session_style);
          inject_cs(session, tab.id, !reinject_cs_handlers_on_existing_session);

        } else {
          log.info('%c (get_session_by_tab - existing - never injected: rejecting non-allowable TLD/URL [' + url_ex_hash + '])', session_style);
          setIconApp(url_ex_hash, 'black', '!(MM)', BG_INACTIVE_COLOR);
        }
      }, function (error) {
        StackTrace.fromError(error).then(errorStackTracking).catch(errBack);;
        if (NotInjectCSUrls.indexOf(url_ex_hash) === -1) {
          NotInjectCSUrls.push(url_ex_hash);
        }
        setIconApp(url_ex_hash, 'black', '*EX1', BG_EXCEPTION_COLOR);
      });

    } else {
      if (reinject_cs_handlers_on_existing_session)
        inject_cs(session, tab.id, !reinject_cs_handlers_on_existing_session);
    }
  }

  //
  // new session (not known in current list) -- inject CS if allowable TLD
  //
  else if (existing_session.length == 0) {

    if (process_url(tab.url)) {
      // call info/allowable for the new session URL
      log.info('%c >>> get_session_by_tab - NEW: ' + tab.url + ' -- calling /allowable...', session_style);

      // record session
      session = new_session(url_ex_hash);
      mm.all_sessions.push(session);
      mm_update(session, true);

      // inject CS only if TLD is allowable
      ajax_isTldAllowable(url_ex_hash, function (data) {
        log.info('%c /allowable... got: ' + JSON.stringify(data), ajax_style_hi);

        if (data.allowable) {

          log.info('%c >>> get_session_by_tab - existing - never injected & allowable [' + url_ex_hash + '] >> injecting (again) ...', session_style);
          inject_cs(session, tab.id, !reinject_cs_handlers_on_existing_session);

        } else {
          log.info('%c (get_session_by_tab - existing - never injected: rejecting non-allowable TLD/URL [' + url_ex_hash + '])', session_style);
          setIconApp(url_ex_hash, 'black', '!(MM)', BG_INACTIVE_COLOR);
        }
      }, function (error) {
        StackTrace.fromError(error).then(errorStackTracking).catch(errBack);;
        if (NotInjectCSUrls.indexOf(url_ex_hash) === -1) {
          NotInjectCSUrls.push(url_ex_hash);
        }
        setIconApp(url_ex_hash, 'black', '*EX1', BG_EXCEPTION_COLOR);
      });

    } else {
      log.info('%c (get_session_by_tab - rejecting non-process URL [' + url_ex_hash + '])', session_style);
    }
  }

  return session;
}

// gets existing session only -- no CS injection, no new session creation
function session_get_by_url(url) {
  var url_ex_hash = bglib_remove_hash_url(url);
  var existing_session = _.filter(mm.all_sessions, function (a) { return a.url == url_ex_hash });
  if (existing_session.length == 1) {
    log.info('%c (get_session_by_url - existing: ' + url + ')', session_style);
    return existing_session[0];
  } else if (existing_session.length == 0)
    log.error('%c ### get_session_by_url - GOT NO URL MATCH! shouldn\'t happen.', session_style_err);
  else
    log.error('%c ### get_session_by_url - GOT >1 URL MATCH! shouldn\'t happen.', session_style_err);
  return null;
}

function session_update_exist_NLP(session, page_meta) {
  if (!session.hasOwnProperty('track_im')) session.track_im = { start: Date.now(), };
  session.page_meta = page_meta;
  log.info('%c >> session[' + session.url + ']', session_style_hi);
  mm_update(session, true);
}

function session_update_NLP(session, nlp, page_meta) {
  // save session page_meta
  session.page_meta = page_meta;
  if (!session.hasOwnProperty('track_im')) session.track_im = { start: Date.now(), };
  if (nlp.topic_specific == '?') {
    log.info('%c >> session[' + session.url + ']', session_style_hi);
    log.info('%c    session.topic_specific = ' + session.topic_specific, session_style);
    log.error('%c    FAILED TO GET A TOPIC_SPECIFIC; skipping NLP save.', session_style_err);
    return;
  }
  if (!session.hasOwnProperty('nlps')) session.nlps = [];

  // save NLP result for dbg/diag
  session.nlps = []; // clear -- keep most recent only
  session.nlps.push(nlp);

  // extract flattened tags -- only using most recent NLP result
  session.tags = [];
  session.topic_specific = nlp.topic_specific;
  _.each(nlp.social_tags, function (a) {
    session.tags.push({ 'tag': a.name, 'score': a.topic_specifc_score });
  });
  _.each(nlp.entities, function (a) {
    session.tags.push({ 'tag': a.name, 'score': 0 });
  });

  log.info('%c >> session[' + session.url + ']', session_style_hi);
  log.info('%c    session.topic_specific = ' + session.topic_specific, session_style);
  log.info('%c ..... session.nlps.length = ' + session.nlps.length, session_style);

  _.each(session.tags, function (a) {
    log.info('%c ..... tag [' + a.tag + '] / score=' + a.score, session_style);
  });

  mm_update(session, true);
}

function session_add_IM(session, data, tab) {
  if (session == null) return;
  if (session.hasOwnProperty('track_im')) {

    // { TOT: seconds
    //   im_score: n
    //   audible_pings: n }
    // -> user_url
    // --> "user engagement value" with the page
    // ****
    // *
    // 0
    // *****

    var audible_weighting = tab.audible ? 2.0 : 0.5;
    var score_mod = 0;

    // init session properties
    if (!session.hasOwnProperty('events')) session.events = [];
    if (!session.hasOwnProperty('clicks')) session.clicks = 0;
    if (!session.hasOwnProperty('scrolls')) session.scrolls = 0;
    if (!session.hasOwnProperty('resizes')) session.resizes = 0;
    if (!session.hasOwnProperty('im_score')) session.im_score = 0;

    // track all events & timestamp
    var session_event = { 'event': data, 'timestamp': Date.now() };
    session.events.push(session_event);

    // track # of discrete events & award scores
    if (data.eventName == 'click' && data.eventValue == 'started') {
      session.clicks++;
      score_mod += 0.5;
    }
    if (data.eventName == 'scroll' && data.eventValue == 'started') {
      session.scrolls++;
      score_mod += 0.25;
    }
    if (data.eventName == 'resize' && data.eventValue == 'started') {
      session.resizes++;
      score_mod += 0.25;
    }

    // specific handler events
    if (data.eventName == 'YT') {
      switch (data.eventValue) {
        case 'fullscreen_btn_click':
          score_mod += 10;
          break;
        case 'player_dblclick':
          score_mod += 10;
          break;

        case 'size_btn_click':
          score_mod += 5;
          break;
        case 'settings_btn_click':
          score_mod += 5;
          break;

        case 'player_click':
          score_mod += 2;
          break;
        case 'play_btn_click':
          score_mod += 2;
          break;

        case 'volume_click':
          score_mod += 1.5;
          break;
        case 'volume_hover':
          score_mod += 1.5;
          break;
      }
    }

    // calc total interaction time (est) on page
    var earliest_session_event = session.events[0];
    var latest_session_event = session.events[session.events.length - 1];
    session.session_millis = latest_session_event.timestamp - earliest_session_event.timestamp;

    // update score
    session.im_score += score_mod * audible_weighting;
    if (score_mod != 0) {
      log.info('%c >> session[' + session.url + ']', session_style);
      log.info('%c ..... session_event = ' + JSON.stringify(session_event), session_style);
      log.info('%c ..... score_mod = ' + score_mod + ' (+ audible_weighting: x' + audible_weighting + ')', session_style);
      log.info('%c ..... session.events.length = ' + session.events.length, session_style);
      log.info('%c ..... session.session_millis = ' + session.session_millis, session_style);
      log.info('%c ..... session.im_score = ' + session.im_score, session_style);
      sessionObservable.lastUpdate = Date.now();
    }

    mm_update(session);
  }
}

function session_add_view_instance(session) {
  if (session != null) {
    if (!session.hasOwnProperty('view_timestamps')) session.view_timestamps = [];

    session.view_timestamps.push(Date.now());
    log.info('%c > NEW SESSION VIEW [' + session.url + '] (view count=' + session.view_timestamps.length + ')', session_style);
    mm_update(session);
  }
}

function session_stop_TOT(session) {
  if (session != null) {
    if (!session.hasOwnProperty('TOT_total_millis')) session.TOT_total_millis = 0;

    session.TOT_cur_stop_at = Date.now();
    if (session.TOT_cur_start_at != 0) {
      log.warn('session_stop_TOT! session.TOT_cur_start_at=' + session.TOT_cur_start_at);

      if (isNaN(session.TOT_cur_stop_at))
        log.error('%c > TOT.stop: TOT_cur_stop_at NaN' + '[' + session.url + '] sid=' + session.sid, session_style_err);
      if (isNaN(session.TOT_cur_start_at))
        log.error('%c > TOT.stop: TOT_cur_start_at NaN' + '[' + session.url + '] sid=' + session.sid, session_style_err);

      var tot_delta_millis = session.TOT_cur_stop_at - session.TOT_cur_start_at;
      if (!isNaN(tot_delta_millis)) {
        session.TOT_total_millis += tot_delta_millis;
        session.TOT_cur_start_at = 0;
        session.TOT_cur_stop_at = 0;
        log.info('%c > TOT.stop: delta=' + tot_delta_millis + ' (new: ' + session.TOT_total_millis / 1000 + ' s)' + '[' + session.url + '] sid=' + session.sid, session_style);
      } else
        log.error('%c > TOT.stop: tot_delta_millis NaN' + '[' + session.url + ']', session_style_err);
    } else
      log.info('%c > TOT.stop: nop - not started [' + session.url + '] sid=' + session.sid, session_style);

    mm_update(session);
  }
}

var TOT_previously_started_session_ids = [];

function session_start_TOT(session) {
  if (session != null) {

    // start session TOT
    if (session.TOT_cur_start_at == 0 || typeof session.TOT_cur_start_at == 'undefined')
      session.TOT_cur_start_at = Date.now();
    else
      log.info('%c > TOT.start: nop - already started [' + session.url + '] sid=' + session.sid, session_style);

    session.TOT_cur_stop_at = 0;
    log.info('%c > TOT.start... [' + session.url + '] sid=' + session.sid, session_style);

    // stop any previously started sessions
    var other_previously_started_sessions = _.filter(mm.all_sessions, function (a) {
      return TOT_previously_started_session_ids.indexOf(a.sid) != -1 && a.sid != session.sid;
    });
    _.each(other_previously_started_sessions, function (a) {
      if (a.TOT_cur_stop_at == 0) // not stopped
        session_stop_TOT(a);
    });

    TOT_previously_started_session_ids.push(session.sid);
    mm_update(session);
  }
}

function session_inc_audible_pings(session) {
  session.audible_pings++;
  mm_update(session);
}

function session_update_page_meta(session, page_meta) {
  set_meta_accessors(page_meta);

  session.page_meta = page_meta;
  log.info('%c > PAGE_META ' + JSON.stringify(page_meta, null, 2) + ' [' + session.url + '] sid=' + session.sid, session_style_hi);

  mm_update(session);
}
