//
// ENTRY POINT
//
// color constant
var BG_SUCCESS_COLOR = '#009900';
var BG_INACTIVE_COLOR = '#999999';
var BG_EXCEPTION_COLOR = '#990000';
var BG_APP_UUID = new_guid();

// ERROR handler
var errBack = function (err) { log.info(err.message); };

var errorStackTracking = function (stackframes) {
  var stringifiedStack = stackframes.map(function (sf) {
    return sf.toString();
  }).join('\n');
  log.warn('error stack', stringifiedStack);
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, function (tabs) {
    if (tabs != null && tabs.length > 0) {
      setIconApp(tabs[0].url, 'black', '*EXBG', BG_EXCEPTION_COLOR);
    }
  });
};

window.onerror = function (msg, file, line, col, error) {
  StackTrace.fromError(error).then(errorStackTracking).catch(errBack);
};

//////////////////////////////////////////////////////
// STARTUP !!!
//
$(document).ready(function () {
  setIconApp('', 'gray', '', BG_INACTIVE_COLOR);
  update_tabmap(function () {

    // Listen for messages from content scripts.
    //chrome.extension.onRequest.addListener(contentScriptHandler);

    // Load the sounds and register event listeners.
    for (var list in soundLists)
      for (var id in soundLists[list])
        loadSound(soundLists[list][id], id);
    for (var name in extensionEvents)
      registerExtensionEventListeners(extensionEvents[name], name);

    // load master data
    mm_load();
  });
});


var isFlashingDog = false;
function animationIcon(tabId, round) {
  log.info('animationIcon on tabId', tabId);
  var sizes = [
    'img/dog_flash.png',
    'img/logo/maoao_blue.png',
    'img/dog_flash2.png',
  ];
  isFlashingDog = true;
  var framePerSecond = 1000 / round;
  var counter = sizes.length * round;
  var timer = setInterval(function () {
    var path = sizes[counter % sizes.length];
    counter -= 1;
    if (counter < 0) {
      isFlashingDog = false;
      clearInterval(timer);
    } else {
      if (tabId) {
        chrome.browserAction.setIcon({
          path: path,
          tabId: tabId,
        });

      } else {
        chrome.browserAction.setIcon({
          path: path,
        });
      }
    }
  }, framePerSecond);
}

/**
 * Set browser icon with image, text and color
 * @param string rawUrl
 * @param image string 3 kinds of image: grey/blue/black
 * @param msg string
 * @param color string text color
 */
function setIconApp(rawUrl, image, msg, color) {
  if (!rawUrl) {
    log.warn('not found url', rawUrl);
    log.trace('not found url');
    return;
  }

  var url = bglib_remove_hash_url(rawUrl);
  var currentTab = tabmap.find(function (item) {
    return item && bglib_remove_hash_url(item.url) === url;
  });
  log.info('currentTab', rawUrl, tabmap, currentTab, image, msg, color);
  if (bglib_remove_hash_url(sessionObservable.activeUrl) === url) {
    log.trace('set icon', rawUrl, image, msg, color);
    chrome.browserAction.setIcon({
      path: 'img/logo/maomao_' + image + '.png',
      tabId: currentTab && currentTab.id,
    });
    sessionObservable.icons.set(url, {
      image: image,
      text: msg,
      color: color,
    });
    if (window.enableIconText) {
      setIconText(msg, color, currentTab && currentTab.id);
    } else {
      if (color === BG_EXCEPTION_COLOR) {
        setIconText(msg, color, currentTab && currentTab.id);
      } else {
        setIconText('', color, currentTab && currentTab.id);
      }
    }
  }
}

function setIconText(s, c, tabId) {
  log.info('setIconText on tabId', tabId, s, c);
  if (tabId) {
    chrome.browserAction.setBadgeText({
      text: s,
      tabId: tabId,
    });
    chrome.browserAction.setTitle({
      title: s,
      tabId: tabId,
    });
    if (c) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: c,
        tabId: tabId,
      });
    }
  } else {
    chrome.browserAction.setBadgeText({
      text: s,
    });
    chrome.browserAction.setTitle({
      title: s,
    });
    if (c) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: c,
      });
    }
  }
}

//////////////////////////////////////////////////////
// SHUTDOWN ??
//
//window.onbeforeunload = function (e) {
//    log.error('onbeforeunload');
//}

//window.onunload = function (e) {
//    log.error('onunload');
//}


//////////////////////////////////////////////////////
// EXTENSION EVENTS
//
function registerExtensionEventListeners(event, name) {
  if (event) {
    var validator = eventValidator[name];
    if (validator) {
      event.addListener(function () {
        log.info('extension event: ' + name);

        // Check this first since the validator may bump the count for future
        // events.
        var canPlay = (eventsToEat == 0);
        if (validator.apply(this, arguments)) {
          if (!canPlay) {
            //log.info('ate event: ' + name);
            eventsToEat--;
            return;
          }
          playSound(name);
        }
      });
    } else {
      event.addListener(function () {
        //log.info('handling event: ' + name);
        if (eatEvent(name)) {
          return;
        }
        playSound(name);
      });
    }
  } else {
    log.info('no event for ' + name);
  }
}

// Remember the last event so that we can avoid multiple events firing
// unnecessarily (e.g. selection changed due to close).
var eventsToEat = 0;

function eatEvent(name) {
  if (eventsToEat > 0) {
    log.info('ate event: ' + name);
    eventsToEat--;
    return true;
  }
  return false;
}


//////////////////////////////////////////////////////
// SCRIPT RE-INJECTION (1) :: onHistoryStateUpdated
//
// YT -- browser navigation needs onHistoryStateUpdated -- for pushState navigation, e.g. YouTube
// https://stackoverflow.com/questions/18397962/chrome-extension-is-not-loading-on-browser-navigation-at-youtube/18398921#18398921
//
// ( related: Twitch -- helper fn. to wait for AJAX elements -- to wait for YT comments loads
// http://stackoverflow.com/questions/27109344/content-script-isnt-firing-on-twitch )
//
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {

  var tab = get_tab(details.tabId);
  if (tab != null)
    if (tab.url != details.url && process_url(tab.url) && tab.active) {
      log.info('onHistoryStateUpdated - ' + JSON.stringify(details));
      log.info('onHistoryStateUpdated - tabId=' + details.tabId + ' frameId=' + details.frameId + ' transitionType=' + details.transitionType + ' [' + details.url + ']');
      log.info('known URL=' + tab.url);
      log.info('details.url=' + details.url);
      log.info('%c >> onHistoryStateUpdated << ', 'background: #222; color: #bada55');

      //var session_new = session_get_by_tab(details, true);
      //session_start_TOT(session_new);
      TOT_start_current_focused(); // update TOT current tab info; required for YT onHistoryStateUpdated...

      update_tabmap();
    } else
      log.info('%c onHistoryStateUpdated - ignorning as URL is not changed from last known.', 'color: gray');
});


//////////////////////////////////////////////////////
// MESSAGE HANDLING :: master callback from content script
//
chrome.extension.onMessage.addListener(function (message, sender, callback) {
  log.info('%c *** GOT MESSAGE > message=' + JSON.stringify(message) + ' ***', 'background: #222; color: #bada55');
  log.info('%c *** GOT MESSAGE > sender=' + JSON.stringify(sender) + ' ***', 'background: #222; color: #bada55');
  var session;

  // replaces deprecated sendRequest
  if (message.doc_event == true) {
    handle_cs_doc_event(message, sender);
  }

  // actually neeed? have forgotten what calls this!!
  // vk.com -- history.pushState() navigation
  // http://stackoverflow.com/questions/13806307/how-to-insert-content-script-in-google-chrome-extension-when-page-was-changed-vi
  if (message == 'Rerun script') {
    // session = session_get_by_url(sender.tab.url);
    session = session_get_by_tab(sender.tab, true);
    log.warn('Rerun script', session);
    if (session != null) inject_cs(session, null, false);
  }

  // session: CS process_text started callback
  //if (message.process_text_start == true) {
  //    if (sender != null) {
  //        //log.info('%c >>> process_text_start', 'background: blue; color: white');
  //        session = get_session_by_url(sender.tab.url);
  //        if (session != null) {
  //            log.info('%c >>> process_text_start [' + session.url + ']', 'background: blue; color: white');
  //            session.process_text_start_timestamp = message.timestamp;
  //        } else log.info('%c ### process_text_start: NO KNOWN SESION!', 'background: red; color: white');
  //    }
  //}

  //
  // session: got NLP result (Calais return) from context script
  //
  if (message && message.payload && message.payload.type && message.payload.type === 'NLP_INFO_KNOWN') {
    if (sender != null) {
      log.info('%c message.session_nlp_result sender.url=' + sender.tab.url, events_style);
      session = session_get_by_url(sender.tab.url);
      if (session != null) {
        log.info('%c message.nlp = ' + JSON.stringify(message.payload.payload.nlp, null, 2), events_style_hi);
        // post result to server
        session_update_exist_NLP(session, message.payload.payload.page_meta);
      }
    }
  }

  if (message && message.payload && message.payload.type && message.payload.type === 'NLP_RESULT') {
    if (sender != null) {
      log.info('%c message.session_nlp_result sender.url=' + sender.tab.url, events_style);
      session = session_get_by_url(sender.tab.url);
      if (session != null) {

        log.info('%c message.nlp = ' + JSON.stringify(message.payload.payload.nlp, null, 2), events_style_hi);
        // post result to server
        session_update_NLP(session, message.payload.payload.nlp, message.payload.payload.page_meta);
      }
    }
  }

  // CS log echoing
  if (message.log_log == true)
    log.info('\t\t' + message.log_msg, message.log_format);
  if (message.log_info == true)
    log.info('\t\t' + message.log_msg, message.log_format);
  if (message.log_warn == true)
    log.warn('\t\t' + message.log_msg, message.log_format);
  if (message.log_error == true)
    log.error('\t\t' + message.log_msg, message.log_format);
});

function after_login(userId) {
  log.warn('after_login', userId);
  window.userId = userId;
  window.isGuest = false;
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    var tab = tabs[0];
    if (tab != null && process_url(tab.url) && tab.active) {
      var session = session_get_by_tab(tab, true);
      session_add_view_instance(session);
    }
  });
}

function after_logout() {
  log.warn('reset data on logout');
  window.isGuest = true;
  window.userId = -1;
  window.userHash = '';
  window.BG_APP_UUID = new_guid();
  window.enableTestYoutube = false;
  window.enableRealtime = false;
  window.enableImscore = false;
  window.enableXpInfo = false;
  window.enableIconText = false;
  window.enableXP = false;
  // TODO: running below code on all tabs
  chrome.tabs.executeScript({
    code: 'mm_app_uuid = ' + undefined + '; mm_user_id = ' + undefined + '; mm_user_hash = ' + undefined + ';'
  });
}

function handle_cs_doc_event(data, sender) {
  // dbg sounds
  if (contentSounds[data.eventName])
    if (data.eventValue == 'started')
      playSound(data.eventName, true);
    else if (data.eventValue == 'stopped')
      stopSound(data.eventName);
    else
      playSound(data.eventName);

  // handle event
  if (sender.tab != null) {
    var tab = sender.tab;
    log.info('tab ' + tab.id + ' (audible=' + tab.audible + ') REQ ' + JSON.stringify(data) + ' [' + tab.url + ']');
    var session = session_get_by_tab(tab, false);

    // maintain session IMs
    if (data.type == 'IM')
      session_add_IM(session, data, tab);
    else {
      // TOT tracking
      if (data.type == 'WINDOW') {

        if (data.eventName == 'onbeforeunload') {
          log.warn('onbeforeunload!');
          session_stop_TOT(session);
        }
        if (data.eventName == 'onload') {
          log.warn('onload!');
          session_start_TOT(session);

          // update TOT active tab
          chrome.tabs.query({
            active: true,
            currentWindow: true
          }, function (tabs) {
            if (tabs != null && tabs.length > 0)
              TOT_active_tab = tabs[0];
          });
        }
      } else if (data.type == 'OTHER') {
        if (data.eventName == 'got_page_meta') { // update session page meta
          var page_meta = data.eventValue;
          session_update_page_meta(session, data.eventValue);
        }
      }
    }
  }
}

function inject_cs(session, tab_id, skip_text) {
  log.info('%c inject_cs tab_id=' + tab_id + ' (skip_text=' + skip_text + ')', log_style);
  //***

  //if (session.hasOwnProperty('injected_cs_timestamp')) {
  //    log.info('%c (injected_cs_timestamp -- inject_cs -- already injected session @ ' + session.injected_cs_timestamp +
  //        ' [' + session.url + '])', 'background: #111; color: #bada55;');
  //    return;
  //}

  //var manifest = chrome.runtime.getManifest();
  var cs_files = [
    'js0/lib/jquery-1.11.3.js',
    'js0/lib/underscore.js',
    'js0/lib/wait_key_elements.js',
    'js0/nlp/stopwords.js',
    'js0/lib/nlp.js',
    'js0/lib/stacktrace.js',
    'js0/lib/md5.js',
    'js0/lib/justext/justext.js',
    'js0/lib/franc.js',
    'js0/ajax/mm_api.js',
    'js0/nlp/calais.js',
    'js0/cs/cs_meta.js',
    'js0/cs/cs_main.js',
    'js0/cs/cs_retok.js',
  ];
  if (!skip_text) {
    cs_files.push('js0/cs/cs_text.js');
  }

  if (enableTestYoutube) {
    cs_files.push('js0/cs/cs_youtube.js');
  }

  var log_style = !skip_text ? 'background: #555; color: #bada55; font-size:larger;' :
    'background: #555; color: #bada55;';

  var run_at = 'document_end'; // document_idle

  if (tab_id == null) {
    //
    // inject current tab
    //
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      if (chrome.runtime.lastError) {
        log.warn(chrome.runtime.lastError);
      }
      var current_tab;
      if (tabs != null && tabs.length > 0) {
        current_tab = tabs[0];
      } else {
        log.warn('not found tab', tab_id);
        return;
      }

      var process = process_url(current_tab.url);
      if (process && !isGuest && current_tab.active) {
        // check allowable on tab.url -- caller should/will have done this, but the tab url can change after dispatching the request for CS injection!
        ajax_isTldAllowable(current_tab.url, function (data) {
          log.info('%c /allowable (2.1)... got: ' + JSON.stringify(data), session_style);
          if (data.allowable) {
            chrome.tabs.executeScript({
              code: 'function mm_app_uuid(){ return "' + window.BG_APP_UUID + '";} function mm_user_id(){ return ' + window.userId + ';} function mm_user_hash(){ return "' + window.userHash + '";}'
            });
            $.each(cs_files, function (ndx, cs) {
              try {
                chrome.tabs.executeScript({
                  file: cs,
                  runAt: run_at
                }, function (result) {
                  if (chrome.runtime.lastError) {
                    log.warn(chrome.runtime.lastError);
                  }
                  // log.info('inject file', cs, run_at, result);
                });
              } catch (err) {
                log.info('%c (re)injection **FAILED** tab_id=' + tab_id + ' [' + current_tab.url + '] (skip_text=' + skip_text + ')', log_style);
                log.warn(err);
              }
            });
            log.info('%c (re)injection OK current_tab (skip_text=' + skip_text + ')', log_style);
            if (session != null)
              session.injected_cs_timestamp = Date.now();
          } else {
            setIconApp(current_tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
          }
        }, function (error) {
          StackTrace.fromError(error).then(errorStackTracking).catch(errBack);;
          if (NotInjectCSUrls.indexOf(tab.url) === -1) {
            NotInjectCSUrls.push(tab.url);
          }
          setIconApp(current_tab.url, 'black', '*EX1', BG_EXCEPTION_COLOR);
        });
      } else {
        log.warn('Do not inject cs on url #1', current_tab.url);
        if (isGuest) {
          setIconApp(current_tab.url, 'gray', '!(MM)', BG_INACTIVE_COLOR);
        } else {
          setIconApp(current_tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
        }
      }
    });
  } else {
    //
    // inject specific tab id
    //
    chrome.tabs.get(tab_id, function (tab) {
      if (chrome.runtime.lastError) {
        log.warn(chrome.runtime.lastError);
      }
      if (tab != null) {
        var process = process_url(tab.url);
        if (process && !isGuest && tab.active) {
          // check allowable on tab.url -- caller should/will have done this, but the tab url can change after dispatching the request for CS injection!
          ajax_isTldAllowable(tab.url, function (data) {
            log.info('%c /allowable (2.2)... got: ' + JSON.stringify(data), session_style);
            chrome.tabs.get(tab_id, function (existTab) {
              if (chrome.runtime.lastError) {
                log.warn(chrome.runtime.lastError);
              }
              if (existTab && existTab.url === tab.url) {
                if (data.allowable) {
                  chrome.tabs.executeScript({
                    code: 'function mm_app_uuid(){ return "' + window.BG_APP_UUID + '";} function mm_user_id(){ return ' + window.userId + ';} function mm_user_hash(){ return "' + window.userHash + '";}'
                  });
                  $.each(cs_files, function (ndx, cs) {
                    try {
                      chrome.tabs.executeScript(tab_id, {
                        file: cs,
                        runAt: run_at
                      }, function (result) {
                        if (chrome.runtime.lastError) {
                          log.warn(chrome.runtime.lastError);
                        }
                        // log.info('inject file', cs, run_at, result);
                      });
                    } catch (err) {
                      log.info('%c (re)injection **FAILED** tab_id=' + tab_id + ' [' + tab.url + '] (skip_text=' + skip_text + ')', log_style);
                      log.warn(err);
                    }
                  });
                  log.info('%c (re)injection OK tab_id=' + tab_id + ' [' + tab.url + '] (skip_text=' + skip_text + ')', log_style);
                  if (session != null)
                    session.injected_cs_timestamp = Date.now();
                } else {
                  setIconApp(tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
                }
              }
            });
          }, function (error) {
            StackTrace.fromError(error).then(errorStackTracking).catch(errBack);;
            if (NotInjectCSUrls.indexOf(tab.url) === -1) {
              NotInjectCSUrls.push(tab.url);
            }
            setIconApp(tab.url, 'black', '*EX1', BG_EXCEPTION_COLOR);
          });
        } else {
          if (isGuest) {
            setIconApp(tab.url, 'gray', '!(MM)', BG_INACTIVE_COLOR);
          } else {
            setIconApp(tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
          }
        }
      }
    });
  }
}


//////////////////////////////////////////////////////
// Sounds
//

// dbg sound handler uses this to fwd events to main handlers ('validators')
var eventValidator = {
  'tabCreated': tabCreated,
  'tabNavigated': tabNavigated,
  'tabRemoved': tabRemoved,
  'tabSelectionChanged': tabSelectionChanged,
  'tabActivated': tabActivated,
  'windowCreated': windowCreated,
  'windowRemoved': windowRemoved,
  'windowFocusChanged': windowFocusChanged,
};

var started = false;

function shouldPlay(id) {
  if (id != 'startup' && !started) // Ignore all events until the startup sound has finished.
    return false;
  var val = localStorage.getItem(id);
  if (val && val != 'enabled')
    return false;
  return true;
}

function didPlay(id) {
  if (!localStorage.getItem(id))
    localStorage.setItem(id, 'enabled');
}

// ** DM -- see below the ignore fast replay is required by current logic! don't remove!
function playSound(id, loop) {
  if (!shouldPlay(id))
    return;

  var sound = sounds[id];
  //log.info('playsound: ' + id);
  if (sound && sound.src) {
    if (!sound.paused) {
      //if (sound.currentTime < 0.2) {
      //  log.info('ignoring fast replay: ' + id + '/' + sound.currentTime);
      //  return;
      //}
      sound.pause();
      sound.currentTime = 0;
    }
    if (loop)
      sound.loop = loop;

    // Sometimes, when playing multiple times, readyState is HAVE_METADATA.
    if (sound.readyState == 0) { // HAVE_NOTHING
      log.info('bad ready state: ' + sound.readyState);
    } else if (sound.error) {
      log.info('media error: ' + sound.error);
    } else {
      didPlay(id);
      sound.play();
    }
  } else {
    log.info('bad playSound: ' + id);
  }
}

function stopSound(id) {
  //log.info('stopSound: ' + id);
  var sound = sounds[id];
  if (sound && sound.src && !sound.paused) {
    sound.pause();
    sound.currentTime = 0;
  }
}

var base_url = 'http://dl.google.com/dl/chrome/extensions/audio/';

function soundLoadError(audio, id) {
  log.error('failed to load sound: ' + id + '-' + audio.src);
  audio.src = '';
  if (id == 'startup')
    started = true;
}

function soundLoaded(audio, id) {
  //log.info('loaded sound: ' + id);
  sounds[id] = audio;
  if (id == 'startup')
    playSound(id);
}

// Hack to keep a reference to the objects while we're waiting for them to load.
var notYetLoaded = {};

function loadSound(file, id) {
  if (!file.length) {
    log.info('no sound for ' + id);
    return;
  }
  var audio = new Audio();
  audio.id = id;
  audio.onerror = function () {
    soundLoadError(audio, id);
  };
  audio.addEventListener('canplaythrough',
    function () {
      soundLoaded(audio, id);
    }, false);
  if (id == 'startup') {
    audio.addEventListener('ended', function () {
      started = true;
    });
  }
  audio.src = base_url + file;
  audio.load();
  notYetLoaded[id] = audio;
}


var navSound;

function stopNavSound() {
  if (navSound) {
    stopSound(navSound);
    navSound = null;
  }
}

function playNavSound(id) {
  stopNavSound();
  navSound = id;
  playSound(id);
}


/////////////////////////////////////
// EXTENSION EVENTS (tabs & windows)
//

// TABMAP: chrome.tabs.onCreated
function tabCreated(tab) {
  update_tabmap();
  if (eatEvent('tabCreated'))
    return false;
  eventsToEat++; // tabNavigated or tabSelectionChanged
  // TODO - unfortunately, we can't detect whether this tab will get focus, so
  // we can't decide whether or not to eat a second event.
  return true;
}

// TABMAP: chrome.tabs.onRemoved
// TODO: need to save im_score and time_on_tab on db
function tabRemoved(tabId) {
  update_tabmap(function () {
    mm_session_clean();
  });

  if (eatEvent('tabRemoved'))
    return false;
  if (tabId == selectedTabId) {
    eventsToEat++; // tabSelectionChanged
    stopNavSound();
  }
  return true;
}

function windowCreated(window) {

  if (eatEvent('windowCreated'))
    return false;
  eventsToEat += 3; // tabNavigated, tabSelectionChanged, windowFocusChanged
  if (window.incognito) {
    playSound('windowCreatedIncognito');
    return false;
  }
  return true;
}

// TABMAP: chrome.tabs.onUpdated
var events_style_hi = 'background: orange; color: white;';
var events_style = 'background: white; color: orange;';
var events_style_err = 'background: red; color: white;';

// TODO: stop tracking TOT for last url
function tabNavigated(tabId, changeInfo, tab) {
  log.warn('tabNavigated tabId=' + tabId +
    ' ci.status=' + changeInfo.status +
    ' ci.url=' + changeInfo.url +
    ' ci.pinned=' + changeInfo.pinned +
    ' ci.audible=' + changeInfo.audible +
    ' ci.mutedInfo=' + changeInfo.mutedInfo +
    ' ci.favIconUrl=' + changeInfo.favIconUrl);
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    var tab = tabs[0];
    if (tab != null) {
      log.info('%c >tabNavigated (chrome.tabs.query callback, tabs.len=' + tabs.length + '): [' + tab.url + ']', events_style_hi);
      // track session 'instances', i.e. every time the session has been navigated to (loaded or tabbed to)
      if (changeInfo.status == 'loading' && typeof changeInfo.url != 'undefined') {
        sessionObservable.activeUrl = changeInfo.url;
        if (process_url(changeInfo.url)) {
          var session = session_get_by_tab(tab, true);
          log.trace('set active url');
          session_add_view_instance(session);
        }
      }
    }
  });

  stopSound('keypress'); // hack

  if (changeInfo.status != 'complete') // ???
    return false;

  if (eatEvent('tabNavigated'))
    return false;

  if (navSound)
    stopSound(navSound);
  return true;
}

// TABMAP: chrome.tabs.onSelectionChanged (Deprecated since Chrome 33. Please use tabs.onActivated)
var selectedTabId = -1;

function tabSelectionChanged(tabId) {

  update_tabmap();

  log.info('%c >tabSelectionChanged: [' + tabId + ']', 'color: gray;');

  selectedTabId = tabId;

  if (eatEvent('tabSelectionChanged'))
    return false;
  var count = 7;
  chrome.tabs.get(tabId, function (tab) {
    if (tab != null) {
      var index = tab.index % count;
      playSound('tab' + index);
    }
  });
  return false;
}

// time on tab (TOT) tracking
var TOT_active_tab = null;
var TOT_active_window_id = 0;

function tabActivated(o) { // why getting object here?!
  var tabId = o.tabId;
  log.warn('tabActivated: [' + tabId + ']');
  chrome.tabs.get(tabId, function (new_tab) {
    if (chrome.runtime.lastError)
      log.warn('CHROME ERR ON CALLBACK -- ' + chrome.runtime.lastError.message);
    else if (new_tab != null && new_tab.active) {
      log.info('%c >tabActivated: [' + new_tab.url + ']', events_style_hi);
      // set current tab session
      log.trace('set active url');
      sessionObservable.activeUrl = new_tab.url;

      // stop TOT for previously focused
      if (TOT_active_tab != null && TOT_active_tab.id != new_tab.id) {
        var prev_session = session_get_by_url(TOT_active_tab.url);
        if (prev_session) {
          session_stop_TOT(prev_session);
        }
      }

      // start TOT for newly focused
      if (new_tab != null && process_url(new_tab.url) && new_tab.active) {
        var new_session = session_get_by_tab(new_tab, true); //***
        if (new_session != null) {
          session_start_TOT(new_session);
        }
      }

      // update new active tab
      TOT_active_tab = new_tab;
    }
  });
}

var selectedWindowId = 1;

function windowFocusChanged(windowId) {
  // Fix for edge case: user change google chrome window
  // check active url on current window
  selectedWindowId = windowId;
  log.warn('windowFocusChanged: [windowId=' + windowId + ']');
  var prev_session;

  // fallback to session by url
  if (TOT_active_tab != null && TOT_active_tab.active && sessionObservable.activeUrl) {
    prev_session = session_get_by_url(sessionObservable.activeUrl);
    if (prev_session != null)
      log.warn('windowFocusChanged TOT STOP (old) [' + prev_session.url + ']');
    session_stop_TOT(prev_session);
  }

  // set active url base on window changes
  if (selectedWindowId > 0) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      if (chrome.runtime.lastError) {
        log.warn('windowFocusChanged CHROME ERR ON CALLBACK -- ' + chrome.runtime.lastError.message);
      }
      log.warn('windowFocusChanged active tabs', tabs)
      log.trace('set active url');
      if (tabs.length > 0 && tabs[0].active) {
        sessionObservable.activeUrl = tabs[0].url;
      } else {
        sessionObservable.activeUrl = 'N/A';
      }
      log.warn('windowFocusChanged active activeUrl', sessionObservable.activeUrl)
    });
  } else {
    log.warn('windowFocusChanged active activeUrl', sessionObservable.activeUrl)
    log.trace('set active url');
    sessionObservable.activeUrl = 'N/A';
  }
}

function TOT_start_current_focused() {
  log.warn('TOT_start_current_focused')
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    if (chrome.runtime.lastError) {
      log.warn('CHROME ERR ON CALLBACK -- ' + chrome.runtime.lastError.message);
    }
    else {
      if (tabs.length > 0) {
        TOT_active_tab = tabs[0];
        log.trace('set active url');
        sessionObservable.activeUrl = tabs[0].url;
        // start TOT for newly focused
        var new_session = session_get_by_tab(TOT_active_tab, true); //***
        if (new_session != null) {
          log.warn('windowFocusChanged TOT START (new) [' + new_session.url + ']');
          session_start_TOT(new_session);
        }
      } else {
        log.trace('set active url');
        sessionObservable.activeUrl = 'N/A';
      }
    }
  });
}

// DM**
function windowRemoved(window) {

  //TOT_start_current_focused();
  return true;
}




///////////////////////////////////////////
// BG libs
//
function bglib_remove_hash_url(url) { // remove trailing page anchor # from tab URLs
  var url_ex_hash = url || '';
  var hash_ndx = url_ex_hash.indexOf('#');
  if (hash_ndx != -1)
    url_ex_hash = url_ex_hash.substring(0, hash_ndx);
  return url_ex_hash;
}

function new_guid() {
  var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return guid;
}


//var test_ids = [];
//for (var i = 0; i < 100000; i++) {
//    var id = new_guid();
//    if (_.any(test_ids, function (a) { return a == id })) {
//        log.error('COLLISION!');
//    }

//    test_ids.push(id);
//}
//log.info('test_ids.len=' + test_ids.length);
//log.warn(test_ids);
