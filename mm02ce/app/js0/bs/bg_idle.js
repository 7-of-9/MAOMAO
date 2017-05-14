var BG_IDLE_DETECTION = 30; // 30s
var idleState = 'active';
chrome.idle.setDetectionInterval(BG_IDLE_DETECTION);

chrome.idle.onStateChanged.addListener(function (state) {
  log.warn('idleState: ', state);
  idleState = state;
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, function (tabs) {
    if (tabs != null && tabs.length > 0) {
      var session = session_get_by_tab(tabs[0]);
      if (session) {
        if (idleState !== 'active') {
          log.warn('stop tracking session', tabs[0], session);
          session_stop_TOT(session);
        } else {
          log.warn('start tracking session', tabs[0], session);
          session_start_TOT(session);
        }
      } else {
        log.warn('not found session on url', tabs[0]);
      }
    } else {
      log.warn('not found active tab');
    }
  });
});
