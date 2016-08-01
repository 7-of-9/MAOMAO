
var cs_log_style = "background: blue; color: white;"
var cs_log_style_hi = "background: blue; color: white; font-weight:bold;";

console.info("%c **** CS HANDLERS RUNNING... [" + window.location + "] ****", cs_log_style_hi);


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
        console.log("sendEvent: " + event + "," + value);
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
// main/ready
//
    var page_meta;
    $(document).ready(function () { // fires more than once! observed; proven. lol.

        // TODO: crash (consistent?!) https://en.wikipedia.org/wiki/NASA

        // waits DO seem to be needed... 
        var ms_wait = 1000;
        if (cslib_isYouTubeWatch())
            ms_wait = 1500;

        // get page meta
        setTimeout(function () {
            
            page_meta = {
                "html_title": document.title,
            };

            if (cslib_isYouTubeWatch()) {
                //
                // itemprops ("microdata") -- these *alone* (and document.title) are not stale on YT nav's
                // http://stackoverflow.com/questions/27158087/chrome-extension-extracts-wrong-metadata-without-full-page-reload-discrepancy-b
                //
           
                page_meta["ip_name"] = $('meta[itemprop="name"]').attr('content') || "";
                page_meta["ip_description"] = $('meta[itemprop="description"]').attr('content') || "";
                page_meta["ip_thumbnail_url"] = $('link[itemprop="thumbnailUrl"]').attr('href') || "";
                page_meta["ip_embed_url"] = $('link[itemprop="embedURL"]').attr('href') || "";
                page_meta["ip_genre"] = $('meta[itemprop="genre"]').attr('content') || "";

                page_meta["ip_url"] = $('link[itemprop="url"]').attr('href') || "";
                page_meta["ip_paid"] = $('meta[itemprop="paid"]').attr('content') || "";
                page_meta["ip_channelId"] = $('meta[itemprop="channelId"]').attr('content') || "";
                page_meta["ip_videoId"] = $('meta[itemprop="videoId"]').attr('content') || "";
                page_meta["ip_duration"] = $('meta[itemprop="duration"]').attr('content') || "";

                page_meta["ip_unlisted"] = $('meta[itemprop="unlisted"]').attr('content') || "";                // ***
                page_meta["ip_family_friendly"] = $('meta[itemprop="isFamilyFriendly"]').attr('content') || ""; // ***

                page_meta["ip_regions_allowed"] = $('meta[itemprop="regionsAllowed"]').attr('content') || ""; 

            } else {
            
                page_meta["og_title"] = $('meta[property="og:title"]').attr('content') || "";

                page_meta["og_image"] = $('meta[property="og:image"]').attr('content') || ""; // +5
                page_meta["og_sitename"] = $('meta[property="og:site_name"]').attr('content') || ""; // +1

                page_meta["og_type"] = $('meta[property="og:type"]').attr('content') || "";  // +5 if present?! can't really rely on "article" being set 
                page_meta["og_description"] = $('meta[property="og:description"]').attr('content') || "";   // +5
                page_meta["og_url"] = $('meta[property="og:url"]').attr('content') || ""; // +1
                page_meta["og_locale"] = $('meta[property="og:locale"]').attr('content') || ""; // +3

                page_meta["og_article_published_time"] = $('meta[property="og:article:published_time"]').attr('content') || "";     // +10
                page_meta["og_article_modified_time"] = $('meta[property="og:article:modified_time"]').attr('content') || "";       // +10
                page_meta["og_article_author"] = $('meta[property="og:article:author"]').attr('content') || ""; // +10
                page_meta["og_article_tag"] = $('meta[property="og:article:tag"]').attr('content') || "";       // +3 *** ready made topics?!

                page_meta["article_published_time"] = $('meta[property="article:published_time"]').attr('content') || $('meta[name="article:published_time"]').attr('content') ||  "";     // +10
                page_meta["article_modified_time"] = $('meta[property="article:modified_time"]').attr('content') || $('meta[name="article:modified_time"]').attr('content') || "";       // +10
                page_meta["article_published"] = $('meta[property="article:published"]').attr('content') || $('meta[name="article:published"]').attr('content') || "";     // +10
                page_meta["article_modified"] = $('meta[property="article:modified"]').attr('content') || $('meta[name="article:modified"]').attr('content') || "";       // +10

                page_meta["article_publisher"] = $('meta[property="article:publisher"]').attr('content') || $('meta[name="article:publisher"]').attr('content') || "";      // +3
                page_meta["article_section"] = $('meta[property="article:section"]').attr('content') || $('meta[name="article:section"]').attr('content') || "";             // +2
                page_meta["article_subsection"] = $('meta[property="article:subsection"]').attr('content') || $('meta[name="article:subsection"]').attr('content') || "";   // +2
                page_meta["article_author"] = $('meta[property="article:author"]').attr('content') || $('meta[name="article:author"]').attr('content') || "";           // +2
                page_meta["article_tag"] = $('meta[property="article:tag"]').attr('content') || $('meta[name="article:tag"]').attr('content') || "";                 // +2
                page_meta["article_author_name"] = $('meta[property="article:author_name"]').attr('content') || $('meta[name="article:author_name"]').attr('content') || ""; // +2

                // twitter meta -- small +'s for these
                page_meta["tw_card"] = $('meta[name="twitter:card"]').attr('content') || $('meta[property="twitter:card"]').attr('content') || ""; // +1
                page_meta["tw_site"] = $('meta[name="twitter:site"]').attr('content') || $('meta[property="twitter:site"]').attr('content') || ""; // +1
                page_meta["tw_title"] = $('meta[name="twitter:title"]').attr('content') || $('meta[property="twitter:title"]').attr('content') || ""; // +1
                page_meta["tw_description"] = $('meta[name="twitter:description"]').attr('content') || $('meta[property="twitter:description"]').attr('content') || ""; // +1
                page_meta["tw_creator"] = $('meta[name="twitter:creator"]').attr('content') || $('meta[property="twitter:creator"]').attr('content') || ""; // +1

                page_meta["tw_publisher"] = $('meta[name="twitter:publisher"]').attr('content') || $('meta[property="twitter:publisher"]').attr('content') || "";  // +5 ?
                page_meta["tw_image"] = $('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content') || "";             // +2
                page_meta["tw_image_src"] = $('meta[name="twitter:image:src"]').attr('content') || $('meta[property="twitter:image:src"]').attr('content') || ""; // +2
                page_meta["tw_image0"] = $('meta[name="twitter:image0"]').attr('content') || $('meta[property="twitter:image0"]').attr('content') || "";
                page_meta["tw_image1"] = $('meta[name="twitter:image1"]').attr('content') || $('meta[property="twitter:image1"]').attr('content') || "";
                page_meta["tw_image2"] = $('meta[name="twitter:image2"]').attr('content') || $('meta[property="twitter:image2"]').attr('content') || "";
                page_meta["tw_image3"] = $('meta[name="twitter:image3"]').attr('content') || $('meta[property="twitter:image3"]').attr('content') || "";
                page_meta["tw_domain"] = $('meta[name="twitter:domain"]').attr('content') || $('meta[property="twitter:domain"]').attr('content') || "";

                // sailthru -- not sure, but seems fairly popular (techcrunch, reuters, bloomberg)
                page_meta["st_title"] = $('meta[name="sailthru:title"]').attr('content');    // +1
                page_meta["st_tags"] = $('meta[name="sailthru:tags"]').attr('content');      // +3 *** ready made topics?!
                page_meta["st_author"] = $('meta[name="sailthru:author"]').attr('content');  // +15

                // shareaholic (dailymash) -- related to wordpress?
                page_meta["sha_url"] = $('meta[name="shareaholic:url"]').attr('content') || "";                                    // +1
                page_meta["sha_lang"] = $('meta[name="shareaholic:language"]').attr('content') || "";                              // +1
                page_meta["sha_keywords"] = $('meta[name="shareaholic:keywords"]').attr('content') || "";                          // +5
                page_meta["sha_shareable_page"] = $('meta[name="shareaholic:shareable_page"]').attr('content') || "";              // +15 == "true"
                page_meta["sha_image"] = $('meta[name="shareaholic:image"]').attr('content') || "";                                // +1
                page_meta["sha_article_author_name"] = $('meta[name="shareaholic:article_author_name"]').attr('content') || "";    // +1

                // keywords 
                page_meta["search"] = $('link[rel="search"]').attr('href') || "";               // +5
                page_meta["keywords"] = $('meta[name="keywords"]').attr('content') || "";       // +1 [obsolete]

                // misc
                page_meta["synopsis"] = $('meta[name="synopsis"]').attr('content') || "";                 // +3 ?
                page_meta["news_keywords"] = $('meta[name="news_keywords"]').attr('content') || "";       // +15 ?

                page_meta["thumbnail"] = $('meta[name="thumbnail"]').attr('content') || "";  // +10
                page_meta["publisher"] = $('link[rel="publisher"]').attr('content') || $('link[rel="publisher"]').attr('href') || ""; // +10
                page_meta["author"] = $('meta[name="author"]').attr('content') || "";           // +10
                page_meta["image_src"] = $('link[rel="image_src"]').attr('href') || "";      // +3
                page_meta["description"] = $('meta[name="description"]').attr('content') || ""; // +1

                page_meta["pingback"] = $('link[rel="pingback"]').attr('href') || "";           // +10

                page_meta["content_type"] = $('meta[name="contentType"]').attr('content') || "";   // +10 for "Feature" (channel4.com)
                page_meta["publish_date"] = $('meta[name="publishDate"]').attr('content') || "";   // +5 if present? (channel4.com)
                page_meta["articleId"] = $('meta[name="articleId"]').attr('content') || "";        // +5 if present? (channel4.com)

                page_meta["date"] = $('meta[name="date"]').attr('content') || "";        // +15 

                page_meta["canonical"] = $('link[rel="canonical"]').attr('content') || $('link[rel="canonical"]').attr('href') || "";   // +3
                page_meta["shortlink"] = $('link[rel="shortlink"]').attr('content') || $('link[rel="shortlink"]').attr('href') || "";   // +10 ??
                // penalize if shortlink.len == canonical.len (asiaone.com)

                page_meta["generator"] = $('meta[name="generator"]').attr('content') || "";                     // +10
                // but penalize if == og_sitename (asiaone.com)
                // maintain whitelist of generators? e.g. wikipedia "MediaWiki%"

                page_meta["edit_uri"] = $('link[rel="EditURI"]').attr('href') || "";                            // +10

                page_meta["prev"] = $('link[rel="prev"]').attr('content') || $('link[rel="prev"]').attr('href') || ""; // +15
                page_meta["next"] = $('link[rel="next"]').attr('content') || $('link[rel="next"]').attr('href') || ""; // +15

                // other
                page_meta["robots"] = $('meta[name="robots"]').attr('content') || ""; // +1

                page_meta["pragma"] = $('meta[http-equiv="Pragma"]').attr('content') || "";
                // penalize if cotains no-cache (landing pages? asiaone.com)

                page_meta["alternate_count"] = $('link[rel="alternate"]').length; // +2 if > 0

                // FB
                page_meta["fb_app_id"] = $('meta[property="fb:app_id"]').attr('content') || "";
                page_meta["fbpages"] = $('meta[property="fb:pages"]').attr('content') || "";

                // apps
                page_meta["al_android_app_name"] = $('meta[property="al:android:app_name"]').attr('content') || "";
                page_meta["al_android_package"] = $('meta[property="al:android:package"]').attr('content') || "";
                page_meta["al_android_url"] = $('meta[property="al:android:url"]').attr('content') || "";
                page_meta["al_ios_app_name"] = $('meta[property="al:ios:app_name"]').attr('content') || "";
                page_meta["al_ios_app_store_id"] = $('meta[property="al:ios:app_store_id"]').attr('content') || "";
                page_meta["al_ios_url"] = $('meta[property="al:ios:url"]').attr('content') || "";
            }

            //
            // TODO: (*) score meta tags, then determine if should or should not text process
            //       (*) record full (all) meta's on DB for site (unique) -- for analysis post-live / over time, to see what other tags could help
            //
      
            sendEvent("got_page_meta", "OTHER", page_meta);
            console.log(JSON.stringify(page_meta, null, 4));
            console.trace();
        }
        , ms_wait);
   

        // setup up IM events
        listenAndCoalesce(document, "scroll");

        // For some reason, "resize" doesn't seem to work with addEventListener.
        if ((window == window.top) && document.body && !document.body.onresize) {
            document.body.onresize = function(event) {
                sendEvent("resize", "IM", "started");
            };
        }

        listenAndCoalesce(document, "click");

        listenAndCoalesce(document, "keypress", function(event) {
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
            div.innerText = "*";

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

    function cslib_isYouTubeWatch() {
        var url = document.location;
        if (url.host === "www.youtube.com" && url.pathname.indexOf("/watch") != -1)
            return true;
        return false;
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