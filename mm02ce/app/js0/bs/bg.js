//
// ENTRY POINT
//
// color constant
var BG_SUCCESS_COLOR = '#009900';
var BG_INACTIVE_COLOR = '#999999';
var BG_EXCEPTION_COLOR = '#990000';

// ERROR handler
var errBack = function(err) { console.log(err.message); };

var errorStackTracking = function(stackframes) {
    var stringifiedStack = stackframes.map(function(sf) {
        return sf.toString();
    }).join('\n');
    console.warn('error stack', stringifiedStack);
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

/**
 * Set browser icon with image, text and color
 * @param string rawUrl
 * @param image string 3 kinds of image: grey/blue/black
 * @param msg string
 * @param color string text color
 */
function setIconApp(rawUrl, image, msg, color) {
  chrome.browserAction.setIcon({
    path: 'img/ps_sirius_dog_' + image + '.png'
  });
  setIconText(msg, color);
  if (rawUrl) {
    var url = bglib_remove_hash_url(rawUrl);
    console.trace('set icon for', url, msg, color, image);
    sessionObservable.icons.set(url, {
      image: image,
      text: msg,
      color: color,
    });
  }
}

function setIconText(s, c) {
  console.trace('calling icon text');
  chrome.browserAction.setBadgeText({
    text: s
  });
  chrome.browserAction.setTitle({
    title: s
  });
  if (c) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: c
    });
  }
}

//////////////////////////////////////////////////////
// SHUTDOWN ??
//
//window.onbeforeunload = function (e) {
//    console.error('onbeforeunload');
//}

//window.onunload = function (e) {
//    console.error('onunload');
//}


//////////////////////////////////////////////////////
// EXTENSION EVENTS
//
function registerExtensionEventListeners(event, name) {
  if (event) {
    var validator = eventValidator[name];
    if (validator) {
      event.addListener(function () {
        //console.log('extension event: ' + name);

        // Check this first since the validator may bump the count for future
        // events.
        var canPlay = (eventsToEat == 0);
        if (validator.apply(this, arguments)) {
          if (!canPlay) {
            //console.log('ate event: ' + name);
            eventsToEat--;
            return;
          }
          playSound(name);
        }
      });
    } else {
      event.addListener(function () {
        //console.log('handling event: ' + name);
        if (eatEvent(name)) {
          return;
        }
        playSound(name);
      });
    }
  } else {
    console.log('no event for ' + name);
  }
}

// Remember the last event so that we can avoid multiple events firing
// unnecessarily (e.g. selection changed due to close).
var eventsToEat = 0;

function eatEvent(name) {
  if (eventsToEat > 0) {
    console.log('ate event: ' + name);
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
    if (tab.url != details.url && process_url(tab.url)) {
      console.info('onHistoryStateUpdated - ' + JSON.stringify(details));
      console.info('onHistoryStateUpdated - tabId=' + details.tabId + ' frameId=' + details.frameId + ' transitionType=' + details.transitionType + ' [' + details.url + ']');
      console.info('known URL=' + tab.url);
      console.info('details.url=' + details.url);
      console.info('%c >> onHistoryStateUpdated << ', 'background: #222; color: #bada55');

      //var session_new = session_get_by_tab(details, true);
      //session_start_TOT(session_new);
      TOT_start_current_focused(); // update TOT current tab info; required for YT onHistoryStateUpdated...

      update_tabmap();
    } else
      console.info('%c onHistoryStateUpdated - ignorning as URL is not changed from last known.', 'color: gray');
});


//////////////////////////////////////////////////////
// MESSAGE HANDLING :: master callback from content script
//
chrome.extension.onMessage.addListener(function (message, sender, callback) {
  // console.info('%c *** GOT MESSAGE > message=' + JSON.stringify(message) + ' ***', 'background: #222; color: #bada55');
  // console.info('%c *** GOT MESSAGE > sender=' + JSON.stringify(sender) + ' ***', 'background: #222; color: #bada55');
  var session;

  if (message && message.payload && message.payload.type && message.payload.type === 'USER_AFTER_LOGIN') {
    isGuest = false;
    userId = parseInt(message.payload.payload.userId);
    session = session_get_by_tab(sender.tab, true);
    session_add_view_instance(session);
  }

  if (message && message.payload && message.payload.type && message.payload.type === 'USER_AFTER_LOGOUT') {
    isGuest = true;
    userId = -1;
  }

  // replaces deprecated sendRequest
  if (message.doc_event == true) {
    handle_cs_doc_event(message, sender);
  }

  // actually neeed? have forgotten what calls this!!
  // vk.com -- history.pushState() navigation
  // http://stackoverflow.com/questions/13806307/how-to-insert-content-script-in-google-chrome-extension-when-page-was-changed-vi
  if (message == 'Rerun script') {
    console.trace('Rerun script');
    session = session_get_by_url(sender.tab.url);
    if (session != null)
      inject_cs(session, null, false);
  }

  // session: CS process_text started callback
  //if (message.process_text_start == true) {
  //    if (sender != null) {
  //        //console.info('%c >>> process_text_start', 'background: blue; color: white');
  //        session = get_session_by_url(sender.tab.url);
  //        if (session != null) {
  //            console.info('%c >>> process_text_start [' + session.url + ']', 'background: blue; color: white');
  //            session.process_text_start_timestamp = message.timestamp;
  //        } else console.info('%c ### process_text_start: NO KNOWN SESION!', 'background: red; color: white');
  //    }
  //}

  //
  // session: got NLP result (Calais return) from context script
  //
  if (message && message.payload && message.payload.type && message.payload.type === 'NLP_INFO_KNOWN') {
    if (sender != null) {
      console.info('%c message.session_nlp_result sender.url=' + sender.tab.url, events_style);
      session = session_get_by_url(sender.tab.url);
      if (session != null) {
        console.info('%c message.nlp = ' + JSON.stringify(message.payload.payload.nlp, null, 2), events_style_hi);
        // post result to server
        session_update_exist_NLP(session, message.payload.payload.page_meta);
      }
    }
  }

  if (message && message.payload && message.payload.type && message.payload.type === 'NLP_RESULT') {
    if (sender != null) {
      console.info('%c message.session_nlp_result sender.url=' + sender.tab.url, events_style);
      session = session_get_by_url(sender.tab.url);
      if (session != null) {

        console.info('%c message.nlp = ' + JSON.stringify(message.payload.payload.nlp, null, 2), events_style_hi);
        // post result to server
        session_update_NLP(session, message.payload.payload.nlp, message.payload.payload.page_meta);
      }
    }
  }

  // CS console echoing
  if (message.console_log == true)
    console.log('\t\t' + message.console_msg, message.console_format);
  if (message.console_info == true)
    console.info('\t\t' + message.console_msg, message.console_format);
  if (message.console_warn == true)
    console.warn('\t\t' + message.console_msg, message.console_format);
  if (message.console_error == true)
    console.error('\t\t' + message.console_msg, message.console_format);
});

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
    console.log('tab ' + tab.id + ' (audible=' + tab.audible + ') REQ ' + JSON.stringify(data) + ' [' + tab.url + ']');
    var session = session_get_by_tab(tab, false);

    // maintain session IMs
    if (data.type == 'IM')
      session_add_IM(session, data, tab);
    else {
      // TOT tracking
      if (data.type == 'WINDOW') {

        if (data.eventName == 'onbeforeunload') {
          console.warn('onbeforeunload!');
          session_stop_TOT(session);
        }
        if (data.eventName == 'onload') {
          console.warn('onload!');
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
  console.info('%c inject_cs tab_id=' + tab_id + ' (skip_text=' + skip_text + ')', log_style);
  console.trace('inject_cs');
  //***

  //if (session.hasOwnProperty('injected_cs_timestamp')) {
  //    console.info('%c (injected_cs_timestamp -- inject_cs -- already injected session @ ' + session.injected_cs_timestamp +
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
        console.warn(chrome.runtime.lastError);
      }
      if (tabs != null && tabs.length > 0)
        var current_tab = tabs[0];

      var process = process_url(tab.url);
      if (process && !isGuest && NotInjectCSUrls.indexOf(tab.url) === -1) {
        // check allowable on tab.url -- caller should/will have done this, but the tab url can change after dispatching the request for CS injection!
        ajax_isTldAllowable(tab.url, function (data) {
          console.log('%c /allowable (2.1)... got: ' + JSON.stringify(data), session_style);
          chrome.tabs.get(tab_id, function (existTab) {
            if (chrome.runtime.lastError) {
              console.warn(chrome.runtime.lastError);
            }
            if (existTab && existTab.url === tab.url) {
              if (data.allowable) {
                chrome.tabs.executeScript({
                  code: 'function mm_user_id(){ return ' + window.userId + ';} function mm_user_hash(){ return "' + window.userHash + '";}'
                });
                $.each(cs_files, function (ndx, cs) {
                  try {
                    chrome.tabs.executeScript({
                      file: cs,
                      runAt: run_at
                    }, function (result) {
                      if (chrome.runtime.lastError) {
                        console.warn(chrome.runtime.lastError);
                      }
                      console.info('inject file', cs, run_at, result);
                    });
                  } catch (err) {
                    console.info('%c (re)injection **FAILED** tab_id=' + tab_id + ' [' + tab.url + '] (skip_text=' + skip_text + ')', log_style);
                    console.trace();
                    console.warn(err);
                  }
                });
                console.info('%c (re)injection OK current_tab (skip_text=' + skip_text + ')', log_style);
                console.trace();
                if (session != null)
                  session.injected_cs_timestamp = Date.now();
              } else {
                setIconApp(tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
              }
            }
          });
        }, function (error) {
          console.error(error);
          if(NotInjectCSUrls.indexOf(tab.url) === -1) {
            NotInjectCSUrls.push(tab.url);
          }
          setIconApp(tab.url, 'black', '*EX1', BG_EXCEPTION_COLOR);
        });
      } else {
        console.warn('Do not inject cs on url #1', tab.url);
      }
    });
  } else {
    //
    // inject specific tab id
    //
    chrome.tabs.get(tab_id, function (tab) {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError);
      }
      if (tab != null) {
        var process = process_url(tab.url);
        if (process && !isGuest && NotInjectCSUrls.indexOf(tab.url) === -1) {
          // check allowable on tab.url -- caller should/will have done this, but the tab url can change after dispatching the request for CS injection!
          ajax_isTldAllowable(tab.url, function (data) {
            console.log('%c /allowable (2.2)... got: ' + JSON.stringify(data), session_style);
            chrome.tabs.get(tab_id, function (existTab) {
              if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError);
              }
              if (existTab && existTab.url === tab.url) {
                if (data.allowable) {
                  chrome.tabs.executeScript({
                    code: 'function mm_user_id(){ return ' + window.userId + ';} function mm_user_hash(){ return "' + window.userHash + '";}'
                  });
                  $.each(cs_files, function (ndx, cs) {
                    try {
                      chrome.tabs.executeScript(tab_id, {
                        file: cs,
                        runAt: run_at
                      }, function (result) {
                        if (chrome.runtime.lastError) {
                          console.warn(chrome.runtime.lastError);
                        }
                        console.info('inject file', cs, run_at, result);
                      });
                    } catch (err) {
                      console.info('%c (re)injection **FAILED** tab_id=' + tab_id + ' [' + tab.url + '] (skip_text=' + skip_text + ')', log_style);
                      console.trace();
                      console.warn(err);
                    }
                  });
                  console.info('%c (re)injection OK tab_id=' + tab_id + ' [' + tab.url + '] (skip_text=' + skip_text + ')', log_style);
                  if (session != null)
                    session.injected_cs_timestamp = Date.now();
                } else {
                  setIconApp(tab.url, 'black', '!(MM)', BG_INACTIVE_COLOR);
                }
              }
            });
          }, function (error) {
            console.error(error);
            if(NotInjectCSUrls.indexOf(tab.url) === -1) {
              NotInjectCSUrls.push(tab.url);
            }
            setIconApp(tab.url, 'black', '*EX1', BG_EXCEPTION_COLOR);
          });
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
  //console.log('playsound: ' + id);
  if (sound && sound.src) {
    if (!sound.paused) {
      //if (sound.currentTime < 0.2) {
      //  console.log('ignoring fast replay: ' + id + '/' + sound.currentTime);
      //  return;
      //}
      sound.pause();
      sound.currentTime = 0;
    }
    if (loop)
      sound.loop = loop;

    // Sometimes, when playing multiple times, readyState is HAVE_METADATA.
    if (sound.readyState == 0) { // HAVE_NOTHING
      console.log('bad ready state: ' + sound.readyState);
    } else if (sound.error) {
      console.log('media error: ' + sound.error);
    } else {
      didPlay(id);
      sound.play();
    }
  } else {
    console.log('bad playSound: ' + id);
  }
}

function stopSound(id) {
  //console.log('stopSound: ' + id);
  var sound = sounds[id];
  if (sound && sound.src && !sound.paused) {
    sound.pause();
    sound.currentTime = 0;
  }
}

var base_url = 'http://dl.google.com/dl/chrome/extensions/audio/';

function soundLoadError(audio, id) {
  console.error('failed to load sound: ' + id + '-' + audio.src);
  audio.src = '';
  if (id == 'startup')
    started = true;
}

function soundLoaded(audio, id) {
  //console.log('loaded sound: ' + id);
  sounds[id] = audio;
  if (id == 'startup')
    playSound(id);
}

// Hack to keep a reference to the objects while we're waiting for them to load.
var notYetLoaded = {};

function loadSound(file, id) {
  if (!file.length) {
    console.log('no sound for ' + id);
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

function tabNavigated(tabId, changeInfo, tab) {

  console.log('%c >tabNavigated tabId=' + tabId +
    ' ci.status=' + changeInfo.status +
    ' ci.url=' + changeInfo.url +
    ' ci.pinned=' + changeInfo.pinned +
    ' ci.audible=' + changeInfo.audible +
    ' ci.mutedInfo=' + changeInfo.mutedInfo +
    ' ci.favIconUrl=' + changeInfo.favIconUrl, events_style_hi);

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    var tab = tabs[0];
    if (tab != null) {
      console.info('%c >tabNavigated (chrome.tabs.query callback, tabs.len=' + tabs.length + '): [' + tab.url + ']', events_style_hi);
      // track session 'instances', i.e. every time the session has been navigated to (loaded or tabbed to)
      if (changeInfo.status == 'loading' && typeof changeInfo.url != 'undefined') {
        var session = session_get_by_tab(tab, true);
        sessionObservable.activeUrl = changeInfo.url;
        session_add_view_instance(session);
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

  console.info('%c >tabSelectionChanged: [' + tabId + ']', 'color: gray;');

  selectedTabId = tabId;

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    var tab = tabs[0];
    if (tab != null && process_url(tab.url)) {
      console.info('%c >tabSelectionChanged: [' + tab.url + ']', events_style_hi);
      var session = session_get_by_tab(tab, true);
      session_add_view_instance(session);
    }
  });

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
  console.info('%c >tabActivated: [' + tabId + ']', 'color: gray;');
  chrome.tabs.get(tabId, function (new_tab) {
    if (chrome.runtime.lastError)
      console.warn('CHROME ERR ON CALLBACK -- ' + chrome.runtime.lastError.message);
    else if (new_tab != null) {
      console.info('%c >tabActivated: [' + new_tab.url + ']', events_style_hi);
      // set current tab session
      sessionObservable.activeUrl = new_tab.url;

      // stop TOT for previously focused
      if (TOT_active_tab != null && TOT_active_tab.id != new_tab.id) {
        var prev_session = session_get_by_tab(TOT_active_tab, false);
        session_stop_TOT(prev_session);
      }

      // start TOT for newly focused
      var new_session = session_get_by_tab(new_tab, true); //***
      if (new_session != null) {
        session_start_TOT(new_session);
      }

      // update new active tab
      TOT_active_tab = new_tab;
    }
  });
}

var selectedWindowId = -1;

function windowFocusChanged(windowId) {
  // Fix for edge case: user change google chrome window
  sessionObservable.activeUrl = '';
  if (windowId == selectedWindowId) return false;
  selectedWindowId = windowId;

  console.info('%c >windowFocusChanged: [' + selectedWindowId + ']', 'color: gray;');

  if (TOT_active_tab != null) {

    var prev_session = session_get_by_tab(TOT_active_tab, false);
    if (prev_session != null)
      console.warn('windowFocusChanged TOT STOP (old) [' + prev_session.url + ']');

    // stop TOT for previously focused
    session_stop_TOT(prev_session);
  }

  // update TOT active tab
  TOT_start_current_focused();

  return true;
}

function TOT_start_current_focused() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    if (chrome.runtime.lastError)
      console.warn('CHROME ERR ON CALLBACK -- ' + chrome.runtime.lastError.message);
    else {
      if (tabs.length > 0) {
        TOT_active_tab = tabs[0];

        // start TOT for newly focused
        var new_session = session_get_by_tab(TOT_active_tab, true); //***
        if (new_session != null) {
          console.warn('windowFocusChanged TOT START (new) [' + new_session.url + ']');
          session_start_TOT(new_session);
        }
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
  var url_ex_hash = url;
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
//        console.error('COLLISION!');
//    }

//    test_ids.push(id);
//}
//console.info('test_ids.len=' + test_ids.length);
//console.dir(test_ids);
