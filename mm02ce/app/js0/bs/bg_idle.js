var BG_IDLE_DETECTION = 30; // 30s
var idleState = 'active';
chrome.idle.setDetectionInterval(BG_IDLE_DETECTION);

chrome.idle.onStateChanged.addListener(function (state) {
  log.info('idleState: ', idleState);
  idleState = state;
});
