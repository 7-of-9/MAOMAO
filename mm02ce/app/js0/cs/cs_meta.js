
///////////////////////////////////////////
// GET PAGE META DATA
//

var page_meta;

function get_page_metadata(fast_refresh, callback) {
  page_meta = null;

  // these waits are needed; the non-YT wait could potentially be reduced, but not by too much.
  // DOM does not seem to be correctly populated re. meta tags without any wait!?
  if (fast_refresh)
    ms_wait = 50;
  else {
    var ms_wait = fast_refresh ? 1 : 1000;
    if (document.getElementById('maomao-extension-youtube-test')) {
      if (cslib_isYouTubeWatch())
        ms_wait = 500;
    } else {
      console.info("Disable youtube test");
    }
  }

  // get page meta
  setTimeout(function () {

    page_meta = {
      nlp_suitability_score: 0, // we'll update this as we analyze the metadata, to indicate how suitable we think (guess) the page is for NLP processing
      html_title: document.title,
    };

    if (document.getElementById('maomao-extension-youtube-test') && cslib_isYouTubeWatch()) {

      //
      // itemprops ("microdata") -- these *alone* (and document.title) are not stale on YT navigations
      // YT navigates from video to video without a full page reload ("pushState-based navigation")
      // http://stackoverflow.com/questions/27158087/chrome-extension-extracts-wrong-metadata-without-full-page-reload-discrepancy-b
      //
      // to detect more generally when these pushState nav's have occured;
      // https://stackoverflow.com/questions/18397962/chrome-extension-is-not-loading-on-browser-navigation-at-youtube/18398921#18398921
      //
      page_meta["nlp_suitability_score"] = 99; // favour YouTube! assume that all pages are suitable for NLP processing

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

      // this will be "stale" but is static/consistent across push state YT navigations, so include it -- used by NLP processing
      page_meta["og_sitename"] = $('meta[property="og:site_name"]').attr('content');

    } else {

      //
      // standard path -- for non pushState-based navigation
      //

      // general og: tags -- average +'s for these
      if (page_meta["og_image"] = $('meta[property="og:image"]').attr('content'))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["og_type"] = $('meta[property="og:type"]').attr('content'))) {
        // can't really rely on "article" being set
        if (page_meta["og_type"] == "article")
          page_meta["nlp_suitability_score"] += 10;
        else if (page_meta["og_type"] == "website")
          page_meta["nlp_suitability_score"] -= 5;
      }

      if ((page_meta["og_description"] = $('meta[property="og:description"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["og_locale"] = $('meta[property="og:locale"]').attr('content')))
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["og_url"] = $('meta[property="og:url"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;
      if (page_meta["og_title"] = $('meta[property="og:title"]').attr('content'))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["og_sitename"] = $('meta[property="og:site_name"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;

      // og:article -- big +'s
      if ((page_meta["og_article_published_time"] = $('meta[property="og:article:published_time"]').attr('content')))
        page_meta["nlp_suitability_score"] += 10;
      if ((page_meta["og_article_modified_time"] = $('meta[property="og:article:modified_time"]').attr('content')))
        page_meta["nlp_suitability_score"] += 10;
      if ((page_meta["og_article_author"] = $('meta[property="og:article:author"]').attr('content')))
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["og_article_tag"] = $('meta[property="og:article:tag"]').attr('content')))       // *** ready made topics?!
        page_meta["nlp_suitability_score"] += 5;

      // article tags -- big +'s
      if ((page_meta["article_author"] = $('meta[property="article:author"]').attr('content') || $('meta[name="article:author"]').attr('content')))
        page_meta["nlp_suitability_score"] += 30;
      if ((page_meta["article_author_name"] = $('meta[property="article:author_name"]').attr('content') || $('meta[name="article:author_name"]').attr('content')))
        page_meta["nlp_suitability_score"] += 30;
      if ((page_meta["article_published_time"] = $('meta[property="article:published_time"]').attr('content') || $('meta[name="article:published_time"]').attr('content')))
        page_meta["nlp_suitability_score"] += 20;
      if ((page_meta["article_modified_time"] = $('meta[property="article:modified_time"]').attr('content') || $('meta[name="article:modified_time"]').attr('content')))
        page_meta["nlp_suitability_score"] += 20;
      if ((page_meta["article_published"] = $('meta[property="article:published"]').attr('content') || $('meta[name="article:published"]').attr('content')))
        page_meta["nlp_suitability_score"] += 20;
      if ((page_meta["article_modified"] = $('meta[property="article:modified"]').attr('content') || $('meta[name="article:modified"]').attr('content')))
        page_meta["nlp_suitability_score"] += 20;

      if ((page_meta["article_tag"] = $('meta[property="article:tag"]').attr('content') || $('meta[name="article:tag"]').attr('content')))        // *** ready made topics?!
        page_meta["nlp_suitability_score"] += 5;

      if ((page_meta["article_publisher"] = $('meta[property="article:publisher"]').attr('content') || $('meta[name="article:publisher"]').attr('content')))
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["article_section"] = $('meta[property="article:section"]').attr('content') || $('meta[name="article:section"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["article_subsection"] = $('meta[property="article:subsection"]').attr('content') || $('meta[name="article:subsection"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;

      // twitter general meta
      if ((page_meta["tw_publisher"] = $('meta[name="twitter:publisher"]').attr('content') || $('meta[property="twitter:publisher"]').attr('content')))
        page_meta["nlp_suitability_score"] += 5;

      if ((page_meta["tw_image"] = $('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_image_src"] = $('meta[name="twitter:image:src"]').attr('content') || $('meta[property="twitter:image:src"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_image0"] = $('meta[name="twitter:image0"]').attr('content') || $('meta[property="twitter:image0"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_image1"] = $('meta[name="twitter:image1"]').attr('content') || $('meta[property="twitter:image1"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_image2"] = $('meta[name="twitter:image2"]').attr('content') || $('meta[property="twitter:image2"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_image3"] = $('meta[name="twitter:image3"]').attr('content') || $('meta[property="twitter:image3"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;
      if ((page_meta["tw_domain"] = $('meta[name="twitter:domain"]').attr('content') || $('meta[property="twitter:domain"]').attr('content')))
        page_meta["nlp_suitability_score"] += 2;

      if ((page_meta["tw_creator"] = $('meta[name="twitter:creator"]').attr('content') || $('meta[property="twitter:creator"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;

      if ((page_meta["tw_card"] = $('meta[name="twitter:card"]').attr('content') || $('meta[property="twitter:card"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;
      if ((page_meta["tw_site"] = $('meta[name="twitter:site"]').attr('content') || $('meta[property="twitter:site"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;
      if ((page_meta["tw_title"] = $('meta[name="twitter:title"]').attr('content') || $('meta[property="twitter:title"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;
      if ((page_meta["tw_description"] = $('meta[name="twitter:description"]').attr('content') || $('meta[property="twitter:description"]').attr('content')))
        page_meta["nlp_suitability_score"] += 0;

      // sailthru -- not sure, but seems fairly popular (techcrunch, reuters, bloomberg) -- decent +'s for these
      if ((page_meta["st_author"] = $('meta[name="sailthru:author"]').attr('content')))
        page_meta["nlp_suitability_score"] += 30;

      if ((page_meta["st_tags"] = $('meta[name="sailthru:tags"]').attr('content')))    // *** ready made topics?!
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["st_title"] = $('meta[name="sailthru:title"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;

      // shareaholic (dailymash) -- related to wordpress?
      if ((page_meta["sha_shareable_page"] = $('meta[name="shareaholic:shareable_page"]').attr('content')))
        page_meta["nlp_suitability_score"] += (page_meta["sha_shareable_page"] == "true" ? 15 : 0);

      if ((page_meta["sha_keywords"] = $('meta[name="shareaholic:keywords"]').attr('content')))
        page_meta["nlp_suitability_score"] += 5;

      if ((page_meta["sha_url"] = $('meta[name="shareaholic:url"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["sha_lang"] = $('meta[name="shareaholic:language"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["sha_image"] = $('meta[name="shareaholic:image"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;
      if ((page_meta["sha_article_author_name"] = $('meta[name="shareaholic:article_author_name"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;

      // keywords
      if ((page_meta["search"] = $('link[rel="search"]').attr('href')))
        page_meta["nlp_suitability_score"] += 5;
      if ((page_meta["keywords"] = $('meta[name="keywords"]').attr('content')))       // [obsolete meta tag]
        page_meta["nlp_suitability_score"] += 1;

      // misc
      if ((page_meta["author"] = $('meta[name="author"]').attr('content')))
        page_meta["nlp_suitability_score"] += 30;
      if ((page_meta["news_keywords"] = $('meta[name="news_keywords"]').attr('content')))
        page_meta["nlp_suitability_score"] += 15;
      if ((page_meta["date"] = $('meta[name="date"]').attr('content')))
        page_meta["nlp_suitability_score"] += 15;
      if ((page_meta["prev"] = $('link[rel="prev"]').attr('content') || $('link[rel="prev"]').attr('href')))
        page_meta["nlp_suitability_score"] += 15;
      if ((page_meta["next"] = $('link[rel="next"]').attr('content') || $('link[rel="next"]').attr('href')))
        page_meta["nlp_suitability_score"] += 15;

      if ((page_meta["thumbnail"] = $('meta[name="thumbnail"]').attr('content')))
        page_meta["nlp_suitability_score"] += 10;
      if ((page_meta["publisher"] = $('link[rel="publisher"]').attr('content') || $('link[rel="publisher"]').attr('href'))) // +10
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["content_type"] = $('meta[name="contentType"]').attr('content')))   // (channel4.com)
        page_meta["nlp_suitability_score"] += (page_meta["content_type"] == "Feature" ? 10 : 0);
      if ((page_meta["publish_date"] = $('meta[name="publishDate"]').attr('content')))   // (channel4.com)
        page_meta["nlp_suitability_score"] += 10;
      if ((page_meta["articleId"] = $('meta[name="articleId"]').attr('content')))        // (channel4.com)
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["image_src"] = $('link[rel="image_src"]').attr('href')))
        page_meta["nlp_suitability_score"] += 5;

      if ((page_meta["synopsis"] = $('meta[name="synopsis"]').attr('content')))
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["description"] = $('meta[name="description"]').attr('content')))
        page_meta["nlp_suitability_score"] += 1;

      if ((page_meta["pingback"] = $('link[rel="pingback"]').attr('href')))
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["canonical"] = $('link[rel="canonical"]').attr('content') || $('link[rel="canonical"]').attr('href')))
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["shortlink"] = $('link[rel="shortlink"]').attr('content') || $('link[rel="shortlink"]').attr('href'))) {
        if (page_meta["canonical"] && page_meta["canonical"].length <= page_meta["shortlink"].length) // penalize if shortlink.len == canonical.len (asiaone.com)
          page_meta["nlp_suitability_score"] -= 20;
        else
          page_meta["nlp_suitability_score"] += 10;
      }

      if ((page_meta["shorturl"] = $('meta[name="ShortURL"]').attr('content') || $('link[name="ShortURL"]').attr('href')))
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["generator"] = $('meta[name="generator"]').attr('content')))
        page_meta["nlp_suitability_score"] += 10; // could (?) penalize if == og_sitename (asiaone.com)

      // TODO: maintain whitelist of generators? e.g. wikipedia "MediaWiki%" ??

      if ((page_meta["edit_uri"] = $('link[rel="EditURI"]').attr('href')))
        page_meta["nlp_suitability_score"] += 10;

      if ((page_meta["edit"] = $('link[rel="edit"]').attr('href')))
        page_meta["nlp_suitability_score"] += 10;

      // other
      if ((page_meta["robots"] = $('meta[name="robots"]').attr('content')))
        page_meta["nlp_suitability_score"] += 3;

      if ((page_meta["pragma"] = $('meta[http-equiv="Pragma"]').attr('content')))
        ;

      if ((page_meta["alternate_count"] = $('link[rel="alternate"]').length))
        if (page_meta["alternate_count"] > 0)
          page_meta["nlp_suitability_score"] += 5;

      // FB
      if ((page_meta["fb_app_id"] = $('meta[property="fb:app_id"]').attr('content')))
        ;
      if ((page_meta["fbpages"] = $('meta[property="fb:pages"]').attr('content')))
        ;

      // apps
      if ((page_meta["al_android_app_name"] = $('meta[property="al:android:app_name"]').attr('content')))
        ;
      if ((page_meta["al_android_package"] = $('meta[property="al:android:package"]').attr('content')))
        ;
      if ((page_meta["al_android_url"] = $('meta[property="al:android:url"]').attr('content')))
        ;
      if ((page_meta["al_ios_app_name"] = $('meta[property="al:ios:app_name"]').attr('content')))
        ;
      if ((page_meta["al_ios_app_store_id"] = $('meta[property="al:ios:app_store_id"]').attr('content')))
        ;
      if ((page_meta["al_ios_url"] = $('meta[property="al:ios:url"]').attr('content')))
        ;
    }

    //
    // TODO: (DONE) score meta tags, then determine if should or should not text process
    //
    //       (*) optimize for YT && WikiPedia && Quora (perfect text cleaning, no need to wait for jusText port)
    //              > can start heavy lifting on cateogy adjacencies and move forward E2E ..., i.e. NLP submission & caching
    //
    //              (1) TOOD: API for determing if a URL has NLP data already DB-cached: new table, w/ full URL
    //                  > just have static "calais_received_at_utc" and "extension_version" fields for now.
    //              (2) TODO: before text processing, check if already DB-cached (ajax)
    //              (3) TODO: if not DB cached, perform calais as-is, and write results to DB cache
    //
    //              (4) TODO: think deep on how to do correlation analysis of NLP topics (aka related cloud tags) ... (ask Dave?!)
    //
    //       (*) Calais limits and plan! http://www.codeproject.com/Articles/801577/A-Review-of-Three-Natural-Language-Processors-Alch
    //              > push text to server for (queue-based) processing, which could throttle / report in limits & client latencies?
    //           but looks like ~1.5-2k per month can buy quite a bit.
    //
    //       (*) AlchemyApi as backup ...
    //
    //       (*) record full (all) meta's on DB for site (unique) -- for analysis post-live / over time, to see what other tags could help
    //       (*) debug/revisit: proper session data (e.g. TOT tracking), session views, etc. >> i.e. debug IM's
    //       (*) [dung] --> jusText port ...
    //
    //       (*) NLP submission and caching for category adjacency learning on server -> really want justext for this, in JS!
    //            >> AlchemyApi --> need fallback from Calais
    //

    if (!fast_refresh) {
      chrome.extension.sendMessage({
        type: 'chromex.dispatch',
        payload: {
          type: 'NLP_SCORE',
          payload: {
            url: document.location.href,
            score: page_meta.nlp_suitability_score,
          }
        }
      });
      sendEvent("got_page_meta", "OTHER", page_meta);
      //console.log(JSON.stringify(page_meta, null, 4));
      //console.trace();
    }

    if (callback)
      callback();
  }, ms_wait);
}
