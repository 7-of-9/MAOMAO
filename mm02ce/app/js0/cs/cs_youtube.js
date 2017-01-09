function cslib_isYouTubeSite() {
  var url = document.location;
  if (url.host === "www.youtube.com")
    return true;
  return false;
}

function cslib_isYouTubeTrending() {
  var url = document.location;
  if (url.host === "www.youtube.com" && url.pathname.indexOf("/feed/trending") != -1)
    return true;
  return false;
}

function cslib_isYouTubeSubscriptions() {
  var url = document.location;
  if (url.host === "www.youtube.com" && url.pathname.indexOf("/feed/subscriptions") != -1)
    return true;
  return false;
}

function cslib_isYouTubeWatch() {
  var url = document.location;
  if (url.host === "www.youtube.com" && url.pathname.indexOf("/watch") != -1)
    return true;
  return false;
}

function cslib_test_NextYouTubeVid(selector) {
  if (cslib_isYouTubeSite()) {
    setTimeout(function () {

      var next = $(selector || ".yt-uix-sessionlink.content-link.spf-link.spf-link"); // def selector: for /watch related links

      var ndx = next ? Math.round(Math.random() * (next.length - 1)) : null;
      if (ndx != null && next[ndx] != null)
        next[ndx].click();
      else {
        //location.reload(true);
        console.error("cslib_test_NextYouTubeVid -- RELOAD (null obj) -- nav back to trending, reseed...");
        cslib_test_Reseed();
      }
    }, 2000);
  }
}

function cslib_test_Reseed() {
  window.location.href = "/feed/trending";
}

$(document).ready(function () {
  // insert html node for checking that is youtube player mode
  console.info("TEST MODE: youtube ...");
  if (document.getElementById('maomao-extension-youtube-test')) {
    console.info("youtube is ready :)");
  } else {
    var anchor = document.createElement('div');
    anchor.id = 'maomao-extension-youtube-test';
    document.body.insertBefore(anchor, document.body.childNodes[0]);
  }

  if (cslib_isYouTubeTrending()) { // TEST MODE: -- use trending as the random-walk seed starting point
    console.log("TEST MODE: YT TRENDING - reseeding ...");
    cslib_test_NextYouTubeVid(".yt-uix-sessionlink.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.spf-link");
    return;
  }
  if (cslib_isYouTubeSubscriptions()) { // TEST MODE: -- use subscriptions as the random-walk seed starting point
    console.log("TEST MODE: YT SUBSCRIPTIONS - reseeding ...");
    cslib_test_NextYouTubeVid(".yt-uix-sessionlink.yt-ui-ellipsis.yt-ui-ellipsis-2.spf-link");
    return;
  }

  if (cslib_isYouTubeWatch()) {

    // http://stackoverflow.com/questions/18477232/how-do-i-make-it-so-my-chrome-extension-will-only-inject-a-script-once
    if (!sessionStorage.getItem("mm_YT_handlersInstalled")) {
      sessionStorage["mm_YT_handlersInstalled"] = "true";

      $(".ytp-fullscreen-button").click(function (e) {
        console.info("%c >> YT: FULLSCREEN - click", "font-weight:bold; color:green");
        sendEvent("YT", "fullscreen_btn_click");
      });
      $(".ytp-settings-button").click(function (e) {
        console.info("%c >> YT: SETTINGS - click", "font-weight:bold; color:green");
        sendEvent("YT", "settings_btn_click");
      });
      $(".ytp-size-button").click(function (e) {
        console.info("%c >> YT: SIZE - click", "font-weight:bold; color:green");
        sendEvent("YT", "size_btn_click");
      });
      $(".ytp-play-button").click(function (e) {
        console.info("%c >> YT: PLAY/PAUSE - click", "font-weight:bold; color:green");
        sendEvent("YT", "play_btn_click");
      });
      $(".ytp-volume-hover-area").hover(function (e) {
        console.info("%c >> YT: VOLUME -- hover", "font-weight:bold; color:green");
        sendEvent("YT", "volume_hover");
      });
      $(".ytp-volume-hover-area").click(function (e) {
        console.info("%c >> YT: VOLUME -- click", "font-weight:bold; color:green");
        sendEvent("YT", "volume_click");
      });

      // player
      $("#player-api").dblclick(function (e) {
        console.info("%c >> YT: PLAYER -- dblclick", "font-weight:bold; color:green");
        sendEvent("YT", "player_dblclick");
      });
      $("#player-api").click(function (e) {
        console.info("%c >> YT: PLAYER -- click", "font-weight:bold; color:green");
        sendEvent("YT", "player_click");
      });
    }

    // https://developers.google.com/youtube/js_api_reference?csw=1#Events

    // http://stackoverflow.com/questions/29328910/get-flash-video-state-in-youtube-site-chrome-extension

    //var x = ytplayer;
    //var theYTplayer = document.getElementById('movie_player'), theYTplayerState;

    //var checkYTplayerReady = setInterval(function () {
    //    theYTplayer = document.getElementById('movie_player');

    //    if (theYTplayer != null) {
    //        clearInterval(checkYTplayerReady);

    //        setTimeout(function () {
    //            checkYTplayerState();
    //        }, 2000);

    //        theYTplayer.addEventListener('onStateChange', checkYTplayerState);
    //    }
    //}, 100);

    //function checkYTplayerState(event) {
    //    theYTplayerState = event;

    //    if (typeof event === 'undefined') {
    //        theYTplayerState = theYTplayer.getPlayerState();
    //    }

    //    if (theYTplayerState == 1) {
    //        theYTplayerState = 'playing';
    //    } else {
    //        theYTplayerState = 'not playing (unstarted/paused/buffering/ended/video cued)';
    //    }

    //    return theYTplayerState;
    //}
  }
});
