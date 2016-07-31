

///////////////////////////////////////////
// GET TEXT ON PAGE ...
//


// $.ready is DEFINITELY firing MORE THAN ONCE for YT nav's -- sometimes twice, sometimes once.
// need some kind of robust and fault-tolerant way of only doing the text procesing once only!
// maybe read session.did_text_proc flag? how CS can get data from BG?
var have_run_text_proc = false;

$(document).ready(function () {
    //document.addEventListener("DOMContentLoaded", function(event) {  // doesn't help
    if (!have_run_text_proc) {
        have_run_text_proc = true;                                     // doesn't help

        // PROOF that this bloody thing fires quite randomly (sometimes) on YT!!!
        // don't boil the ocean, lost enough time on this. make it work "good enough" for now, even 
        // if quite ineffecient and running too many text requests esometimes: good enough is good enough for poc.
        //alert('$(document).ready!!');

        console.info("%c $(document).ready -- readyState=" + document.readyState, "background: blue; color: white");

        // this *masks* the problem of $.ready being called an indeterminate # of times??
        var millisecondsToWait = 1500; // shouldn't be necessary, but is! indeterminate behaviour without this, esp. on YT
        setTimeout(function() {

                if (cslib_isYouTubeWatch()) { // YT handler

                    var comments_disabled = $(".comments-disabled-message");
                    if (comments_disabled.length > 0) { // YT -- comments disabled?
                        console.info("YT -- comments disabled");
                        process_text();
                    } else {

                        /*
                            <div id="comment-section-renderer" class="comment-section-renderer vve-check" data-visibility-tracking="CC0Quy8iEwi7462YwMfNAhWTA2gKHUR1D5Ao-B0=">
                            <div class="action-panel-loading">
                            <p class="yt-spinner ">
                            <span class="yt-spinner-img  yt-sprite" title="Loading icon"></span>

                            <span class="yt-spinner-message">
                            Loading...
                            </span>
                            </p>

                            </div>
                             </div>*/

                        // YT -- wait for comments to load, and parse them (TODO -- FIXME -- can wait forever if they're offscreen!!)
                        console.info("YT -- comments enabled; waiting for load (2)...");
                        waitForKeyElements(".comment-section-header-renderer", function () { //waitForKeyElements("#yt-comments-sb-standin", function() {
                                process_text();
                        }
                            , true // *** bWaitOnce --  very important !!
                        );
                    }

                } else { // fallback handler
                    process_text();
                }
            }
        , millisecondsToWait);
    }
});

var dumb_texts = [];
function process_text() {
    // prevent running text processing more than once (see above: $.ready firing more than once on a variety of conditions)
    console.info("%c >> mm_cs_text_haveRunTextProc=" + sessionStorage["mm_cs_text_haveRunTextProc"], "background:white; color:orange; font-weight:bold;");
    console.info("%c >> document.location=" + document.location, "background:white; color:orange; font-weight:bold;");
    if (document.location == sessionStorage["mm_cs_text_haveRunTextProc"]) {
        console.info("%c >> mm_cs_text_haveRunTextProc=document.location -- NOP: already run text processing for [" + sessionStorage["mm_cs_text_haveRunTextProc"] + "]", "background:orange; color:black; font-weight:bold;");
        return;
    }
    sessionStorage["mm_cs_text_haveRunTextProc"] = document.location;

    console.info("%c **** CS TEXT PROCESSING RUNNING... [" + window.location + "] ****", "background: #888; color: #bada55; font-weight:bold; font-size:large;");
    console.info("%c >> sending process_text_start...", "background:blue; color:white; font-weight:bold;");
    chrome.extension.sendMessage({ "process_text_start": true, "timestamp": Date.now() });
    var t;

    //
    // TODO: handle infinite-scroll AJAX reloads ????, e.g. FB, but also YT comment loads, or ... http://order-order.com/2015/09/07/richs-monday-morning-view-132/#:gQx2naY3qxAdNA
    //
    // or should these not be TOTALLY disregarded? -- especially Facebook!! 
    // an infite scroll single session is surely *fundamentally incompatible*
    // with weighting of session interaction metrics with the specific words in the session! it's really multiple sesssions
    // within a single browser session; each "session" in FB is eyeballs on a timeline item
    //
    // FOR NOW: just totally blacklist/ignore facebook feed -- other *specific* FB pages are probably fine.
    // i.e. DISCRETE item pages are fine, feeds are not.
    //
    // so, probably also don't want to try and handle YT comment loads yet.
    //

    //
    // TODO: / related? only extract VISIBLE element texts, i.e on the screen??
    //
    // also probably too advanced for now; just assume all text (offscreen or not) is to be weighted by the session
    // interaction metrics; hypothesis is that over time the aggregate weightings will have value
    //

    //
    // TODO: this is still a dumb text extraction; there's no WEIGHTING ...
    //       weighting needs to be by the session's interaction metrics (i.e. for the whole page, clicks, scrolls, etc.)
    //  has implications on the data-model...
    //
    // CONCLUSION: GET ONTO VALUE-PROP TEST AS FAST AS POSSIBLE!
    //             
    // MAYBE ...
    // CLEAREST SINGLE USER VALUE PROP -- may be as simple as comparing quora-type SUBJECTS and EXPERIENCE POINTS
    //  with friends; e.g. who knows the most about SUPERCARS, who knows the most about CHESS, etc.
    //  it really means that sessions need to be BOILED DOWN to a SINGLE overarching TOPIC
    //  the relative frequencies etc. of all words in the session is maybe a refinment to that, e.g.
    //  TOPIC=CHESS, session focus=magnus carlson, ruy lopez, etc.
    //  TOPIC=ASTRONOMY, session focus=black holes
    //
    // so; TODO: MUST PREFERANTIALLY PARSE TITLE, HEAD, KEYWORDS, ETC. to get top 1 or top 3 TOPICS for a given session...
    // then just persist session all_text + keywords + interaction metrics into an "enhanced personal history"
    //
    // then really, I'd like to see all my TOPIC sessions grouped together, maybe with an option to send ALL
    // my high-weighted sessions to a friend in bulk ... that makes a lot of sense; individual friends will share an 
    // interest in a specific topic :: 
    //
    //  >>> FULL SCREEN (RAPID) ANIMATION (BACKGROUND FADED) : "ASTRONOMY +10 XP ... 110" <<<
    //
    // THE HOOK: could be as simple as "gamifying the browsing experience" -> I build up EXPERIENCE POINTS or a SCORE
    // for a given TOPIC after interacting with a page sufficiently, e.g. I read about black holes, I get +10 to
    // my ASTRONOMY score. 
    // 
    // the +10 should be weighted by my interaction and the degree and complexity of the page itself...
    //
    // my HOMEPAGE should show what I "earned" for each session, it should GROUP my sessions by TOPIC
    // and I should be able to SHARE entire TOPICs and sessions with my friends...
    //
    //


    //
    // Custom site handlers
    //

    if (cslib_isYouTubeWatch()) {
        console.info(" *** USING YOUTUBE/WATCH HANDLER ***");

        // grab video details text
        var div = $("#action-panel-details");
        if (div != null && div.length > 0) {
            var x = div[0].innerText;
            var t2 = "";
            if (x != null && x.length > 0) {
                var lines = x.split("\n");
                _.each(lines, function (line) {
                    // remove lines /*that contain URLs, or*/ that are < 4 words
                    if (/*line.indexOf("www.") == -1 &&*/ count_words(line) >= 4) {
                        t2 = t2 + line + "\n";
                    }
                });
                t = t2; //.replace(/[\n\r]/g, " ");
            }
        }

        // grab comment text
        t += "\n";
        var comments = $(".comment-renderer-text-content"); //$(".comment-text");
        _.each(comments, function (x) {
            t += x.innerText + "\n";
        });

    } else {
        // generic all-text handler
        console.info(" (using dumb all text handler)");

        var t3_preferred = "";
        for (var i = 0; i < dumb_preferred_root_elements.length ; i++) {
            var preferred = $(dumb_preferred_root_elements[i]);
            if (preferred != null && preferred.length == 1 && preferred[0] != null) {
                console.info(" > DUMB-TEXT PROC - using preferred element: " + preferred);
                t3_preferred = preferred[0].innerText;
                break;
            }
        }

        if (t3_preferred.length == 0) { // dumb-proc ALL text 

            // TODO: need boilerplate removal, for sure!! -- https://github.com/miso-belica/jusText

            console.time("***DUMB-TEXT PROC***");
            var dumb_root_element = document.getElementsByTagName("body")[0];
            allDescendants(dumb_root_element, null); //**
            console.info(dumb_texts.length + " element(s) parsed (DUMB-TEXT).");
            t = dumb_texts.join(" ");
            console.timeEnd("***DUMB-TEXT PROC***");
        } else { // dumb-proc preferred element match text
            t = t3_preferred;
        }
    }

    // remove URLs from string - this seems to throw off calais quite a bit
    t = remove_urls(t);

    // prepend title
    t = page_meta.html_title + "\n\n" + t;

    console.info("ALL_TEXT (1): [" + t + "]");

    //
    // exec calais processing
    //
    if (t.length > 200)
        nlp_calais(page_meta, t);
    else
        console.warn("%c ** NOT ENOUGH TEXT FOR CALAIS PROCESSING! **", "background:black; color:red; font-weight:bold;");

    //---

    // x=-ref...
    //var html = document.body.innerHTML;
    //var t2 = strip(document.body.innerHTML).replace(/[\n\r]/g, " ");
    //console.info("ALL_TEXT (2): [" + t2 + "]");
    //function strip(html) {
    //    var tmp = document.createElement("DIV");
    //    tmp.innerHTML = html;
    //    return tmp.textContent || tmp.innerText || "";
    //}
}

//
// TODO: log (server) TLDs and counts to see which sites need custom handlers or custom preferred elements
//       quite easy to get maximum bang for buck this way
//
var dumb_preferred_root_elements = [
    ".story-body__inner",      // bbc.com
    ".content-column"          // http://news.sky.com/story/1551991/exclusive-watch-moment-raf-jets-get-scrambled
];

function allDescendants(node, parent_node_text) {
    if (node.childNodes != null) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var x = node.childNodes[i];
            //if (nodes.indexOf(x) !== -1) {
            //    console.log("skipping " + x.nodeType + " " + x.nodeName + " already traversed.");
            //} else {
            if (x.offsetParent === null) {
                // hidden;
            } else {
                if (x.nodeName !== "SCRIPT" && x.nodeName !== "STYLE") {
                    if (x.innerText != null && x.innerText.trim().length > 0) {
                        var txt0 = x.innerText.trim();
                        var txt1 = txt0.replace(/[\n\r]/g, " ");

                        // TODO: should not push texts if within % similarity to ALL EXISTING texts blocks...

                        if (texts_already_contains(txt1) === false) {
                            //if (parent_node_text != null && parent_node_text.indexOf(txt1) > -1) {
                            //console.info("! " + x.nodeType + " " + x.nodeName + " [" + txt1 + "]");
                            dumb_texts.push(txt1);
                            //nodes.push(x);

                            //} else {
                            //    console.log("skipping node; texts contained in parent_node_text");
                            //}
                        } else {
                            //console.log("skipping node; identical text already contained in pushed texts [" + txt1 + "]");
                        }

                        //} else {
                        allDescendants(x, txt1); // no innerText, keep recursing
                    }
                }
            }
            //}
        }
    }
}

function texts_already_contains(text) {
    for (var i = 0; i < dumb_texts.length; i++) {
        var x = dumb_texts[i];
        if (x.indexOf(text) !== -1)
            return true;
    }
    return false;
}

function remove_urls(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

function count_words(text) {
    var words = text.split(" ");
    return words == null ? 0 : words.length;
}
