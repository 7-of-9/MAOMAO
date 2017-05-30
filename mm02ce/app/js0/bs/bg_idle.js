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
      // TODO: checking sound is playing or not, then start tracking TOT
      if (session && idleState !== 'active') {
        log.warn('stop tracking session', tabs[0], session);
        session_stop_TOT(session);
      }
    }
  });
});
