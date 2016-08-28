
///////////////////////////////////////////
// CONTEXT SCRIPT -- entry point
//

var cs_log_style_info = "color: blue; baclground: white;"
var cs_log_style = "background: blue; color: white;"
var cs_log_style_hi = "background: blue; color: white; font-weight:bold;";

console.info("%c **** CS HANDLERS RUNNING... [" + window.location + "] ****", cs_log_style_hi);

//
// doc.ready
//
    $(document).ready(function () { // fires more than once! observed; proven. lol.

        get_page_metadata();

        // setup up IM events
        listenAndCoalesce(document, "scroll");

        // For some reason, "resize" doesn't seem to work with addEventListener.
        if ((window == window.top) && document.body && !document.body.onresize) {
            document.body.onresize = function (event) {
                sendEvent("resize", "IM", "started");
            };
        }

        listenAndCoalesce(document, "click");

        listenAndCoalesce(document, "keypress", function (event) {
            if (event.charCode == 13)
                return false;

            // TODO(erikkay) This doesn't work in gmail's rich texts compose window.
            return event.target.tagName == "TEXTAREA" ||
                event.target.tagName == "INPUT" ||
                event.target.isContentEditable;
        });

        // UI/TESTS
        ///////////////////////////////////////////
        // http://www.html5canvastutorials.com/tutorials/html5-canvas-images/
        // fade in/out demo: http://jsfiddle.net/AbdiasSoftware/sndw2/
        // >> http://hakim.se/projects
        // http://lab.hakim.se/flipside/
        // http://lab.hakim.se/ladda/
        // https://github.com/hakimel/reveal.js

        // TODO: (1) not showing on pure signed in page (https://clients.mindbodyonline.com/classic/home?studioid=1092)
        //       (2) not showing on YouTube
        if ($('#mmDiv01').length == 0) {
            var div = document.createElement('div');
            div.id = 'mmDiv01';
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '20px';
            div.style.height = '20px';
            div.style.border = 'solid 2px blue';
            div.style.backgroundColor = 'rgba(225, 225, 225, .4)';
            div.style.zIndex = '99999';
            div.align = 'center';
            div.innerText = 'MM';

            document.body.appendChild(div);
            //document.body.insertBefore(div, document.body.childNodes[0]);
            console.log("appended to body: " + JSON.stringify(div));
            //*[@id="mmDiv01"]
        }


        //var canvas = document.createElement('canvas');
        //canvas.id = "myCanvas";
        //canvas.style = "z-index:-1;position:absolute;left=0px;top=0px";
        ////div.appendChild(canvas);
        //document.body.appendChild(canvas);
        //var canvas = document.getElementById('myCanvas');
        //var context = canvas.getContext('2d');
        //context.beginPath();
        //context.rect(0, 0, 50, 100);
        //context.fillStyle = "rgba(255, 0, 128, 0.5)";
        //context.fill();
        //context.lineWidth = 7;
        //context.strokeStyle = 'black';
        //context.stroke();
    });

    $(window).on('resize', function (event) {
        sendEvent("resize", "IM", "started");
    });


    //window.onpopstate = function (e) {
    //    console.error($('meta[property="og:title"]').attr('content'));
    //};


//
// used by BS for TOT tracking
//
    window.onbeforeunload = function (e) { sendEvent("onbeforeunload", "WINDOW", document.location ); }
    window.onunload = function (e) { sendEvent("onunload", "WINDOW", document.location); }
    window.onload = function(e) { sendEvent("onload", "WINDOW", document.location); }


//
// document events
//
    function sendEvent(event, type, value) {
        //console.log("sendEvent: " + event + "," + value);
        //if (chrome.extension != null) chrome.extension.sendRequest({ eventName: event, eventValue: value });

        var msg = { "doc_event": true, "type": type, "eventName": event, "eventValue": value };
        //console.dir(msg);
        chrome.extension.sendMessage(msg);
    }

    // Timers to trigger "stopEvent" for coalescing events.
    var timers = {};

    function stopEvent(type) {
      timers[type] = 0;
      sendEvent(type, "IM", "stopped");
    }

    // Automatically coalesces repeating events into a start and a stop event.
    // |validator| is a function which should return true if the event is
    // considered to be a valid event of this type.
    function handleEvent(event, type, validator) {
      if (validator) {
        if (!validator(event)) {
          return;
        }
      }
      var timerId = timers[type];
      var eventInProgress = (timerId > 0);
      if (eventInProgress) {
        clearTimeout(timerId);
        timers[type] = 0;
      } else {
        sendEvent(type, "IM", "started");
      }
      timers[type] = setTimeout(stopEvent, 300, type);
    }

    function listenAndCoalesce(target, type, validator) {
      target.addEventListener(type, function(event) {
        handleEvent(event, type, validator);
      }, true);
    }



//
// UTILS
//

    //function cslib_get_meta_tag_byprop(tag_name) {
    //    var metas = document.getElementsByTagName('meta');
    //    for (var i = 0; i < metas.length; i++) {
    //        if (metas[i].getAttribute("property") == tag_name) {
    //            return metas[i].getAttribute("content");
    //        }
    //    }
    //    return "";
    //}

    //function cslib_get_meta_tag_byname(tag_name) {
    //    var metas = document.getElementsByTagName('meta');
    //    for (var i = 0; i < metas.length; i++) {
    //        if (metas[i].getAttribute("name") == tag_name) {
    //            return metas[i].getAttribute("content");
    //        }
    //    }
    //    return "";
    //}

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

    function cslib_words_in_common(a, b) {
        var words_a = a.split(" ");
        var words_b = b.split(" ");
        var words_in_common = [];
        for (var i = 0; i < words_a.length; i++) {
            var word_a = words_a[i];
            if (words_b.indexOf(word_a) != -1)
                words_in_common.push(word_a);
        }
        return words_in_common;
    }

    // log CS and echo to BG console
    function cslib_log(msg, format) {
        console.log(msg, format);
        chrome.extension.sendMessage({ "console_log": true, "console_msg": msg, "console_format": format });
    }

    function cslib_info(msg, format) {
        console.info(msg, format);
        chrome.extension.sendMessage({ "console_info": true, "console_msg": msg, "console_format": format });
    }

    function cslib_warn(msg, format) {
        console.warn(msg, format);
        chrome.extension.sendMessage({ "console_warn": true, "console_msg": msg, "console_format": format });
    }

    function cslib_error(msg, format) {
        console.error(msg, format);
        chrome.extension.sendMessage({ "console_error": true, "console_msg": msg, "console_format": format });
    }

 