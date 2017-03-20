chrome.webRequest.onCompleted.addListener(
  function(info) {
    console.log('onCompleted request: ', info);
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  }
  );

chrome.webRequest.onErrorOccurred.addListener(
  function(info) {
    console.log('onErrorOccurred request: ', info);
    setIconApp(info.url,'black', '!(200)', BG_INACTIVE_COLOR);
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  }
  );
