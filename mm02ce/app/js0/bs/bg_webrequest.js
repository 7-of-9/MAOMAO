chrome.webRequest.onCompleted.addListener(
  function(info) {
    log.info('onCompleted request: ', info);
    if(info.statusCode !== 200) {
      if(NotInjectCSUrls.indexOf(info.url) === -1) {
        NotInjectCSUrls.push(info.url);
      }
      setIconApp(info.url,'black', '!(200)', BG_INACTIVE_COLOR);
    } else {
      // TODO: clear !(200) text on success
      var currentIcon = sessionObservable.icons.get(info.url);
      if(currentIcon && currentIcon.text === '!(200)') {
        setIconApp(info.url,currentIcon.image, '', currentIcon.color);
      }
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  }
  );

chrome.webRequest.onErrorOccurred.addListener(
  function(info) {
    log.info('onErrorOccurred request: ', info);
    setIconApp(info.url,'black', '!(200)', BG_INACTIVE_COLOR);
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  }
  );
