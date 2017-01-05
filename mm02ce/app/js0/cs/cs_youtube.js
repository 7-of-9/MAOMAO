
$(document).ready(function() {

    if (cslib_isYouTubeWatch()) {

        // http://stackoverflow.com/questions/18477232/how-do-i-make-it-so-my-chrome-extension-will-only-inject-a-script-once
        if (!sessionStorage.getItem("mm_YT_handlersInstalled")) {
            sessionStorage["mm_YT_handlersInstalled"] = "true";

            $(".ytp-fullscreen-button").click(function (e) {
                console.info("%c >> YT: FULLSCREEN - click", "font-weight:bold; color:green");
                sendEvent("YT", "fullscreen_btn_click");
            });
            $(".ytp-settings-button").click(function(e) {
                console.info("%c >> YT: SETTINGS - click", "font-weight:bold; color:green");
                sendEvent("YT", "settings_btn_click");
            });
            $(".ytp-size-button").click(function(e) {
                console.info("%c >> YT: SIZE - click", "font-weight:bold; color:green");
                sendEvent("YT", "size_btn_click");
            });
            $(".ytp-play-button").click(function(e) {
                console.info("%c >> YT: PLAY/PAUSE - click", "font-weight:bold; color:green");
                sendEvent("YT", "play_btn_click");
            });
            $(".ytp-volume-hover-area").hover(function(e) {
                console.info("%c >> YT: VOLUME -- hover", "font-weight:bold; color:green");
                sendEvent("YT", "volume_hover");
            });
            $(".ytp-volume-hover-area").click(function(e) {
                console.info("%c >> YT: VOLUME -- click", "font-weight:bold; color:green");
                sendEvent("YT", "volume_click");
            });

            // player
            $("#player-api").dblclick(function(e) {
                console.info("%c >> YT: PLAYER -- dblclick", "font-weight:bold; color:green");
                sendEvent("YT", "player_dblclick");
            });
            $("#player-api").click(function(e) {
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