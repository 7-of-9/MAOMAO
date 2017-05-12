var BG_IDLE_DETECTION = 30; // 30s
var idleState = 'active';
chrome.idle.setDetectionInterval(BG_IDLE_DETECTION);

chrome.idle.onStateChanged.addListener(function (state) {
  log.warn('idleState: ', state);
  idleState = state;
  var session = session_get_by_url(window.sessionObservable.activeUrl);
  if (session) {
    if (idleState !== 'active') {
      log.warn('stop tracking session', window.sessionObservable.activeUrl, session);
      session_stop_TOT(session);
    } else {
      log.warn('start tracking session', window.sessionObservable.activeUrl, session);
      session_start_TOT(session);
    }
  } else {
    log.warn('not found session on url', window.sessionObservable.activeUrl);
  }
});
