chrome.webRequest.onCompleted.addListener(
  function(info) {
    console.log('onCompleted request: ', info);
    if(info.statusCode !== 200) {
      if(apiErrorUrls.indexOf(info.url) === -1) {
        apiErrorUrls.push(info.url);
      }
      setIconApp(info.url,'black', '!(200)', BG_INACTIVE_COLOR);
    }
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
