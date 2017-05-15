//$.getScript('js0/lib/underscore.js', function () {

// Calais backups ...
// http://www.codeproject.com/Articles/801577/A-Review-of-Three-Natural-Language-Processors-Alch

var nlp_test_run = false;

//
// outputs: topic_specific -- ONLY WORKS FROM SOCIAL TAGS!!
//
// this is OK for now, but is definitely a naive approach. The *server* will need to be the arbiter of the final say top 2-3 tags for the URL.
// e.g. sometimes entities (people) are the correct top tags, maybe sometimes a mix of social_tags and entities is the correct categorizaton.
//
//   ... so; TODO -- simply pass ALL the required data to the server (so URL object, and page meta inc title)
//      and rewrite the C# layer to (a) match the social_tag scoring algo's below
//      and then (b) improve on it by also considering entities and probably also (c) even topics for a resultant "top 3" output.
//
//    the server has the distinct advantage that it can then also apply the cross-URL adjacency stuff to the resultant top 3.
//
//   STEP 1: transmit all to server, and have API return the exact same output as below.
//        2: then can improve, considering other tags.
//
//
function calais_process(nlp) {
  var page_meta = nlp.meta;

  var social_tags = _.filter(nlp.items, function (a) { return a.type == "SOCIAL_TAG" });
  _.each(social_tags, function (a) {
    a.candidate_reason = "";
    a.topic_specifc_score = a.importance == 1 ? 15 : a.importance == 2 ? 5 : 1
  });
  nlp.social_tags = social_tags;

  // log entities, order by =" + a.relevance
  var entities = _.filter(nlp.items, { type: "ENTITY" });
  nlp.entities = _.sortBy(entities, function (a) { return a.relevance }).reverse();
  _.each(nlp.entities, function (a) { logger().info("%c" + a.type + " [" + a.name + "] (" + a.entity_type + ") relevance=" + a.relevance, "background:white; color:green; font-weight:bold;") });

  // detect non-specific content (e.g. http://order-order.com/2015/09/11/environment-minister-totty-watch-laissez-phwoar/#:N5GUD2Cxm-B2XA)
  // seems that this "mish-mash" type content doesn't return any entities that are more relevant than any others...
  var no_high_relevance_entities = _.filter(nlp.entities, function (a) { return a.relevance > 0.2 }).length;
  var no_entities = nlp.entities.length;
  var high_relevance_entity_ratio = no_high_relevance_entities / no_entities;

  //
  // -- DISTIL TO SINGLE TOPIC --
  //
  // currently: this makes best-guess out of the social tags only
  //
  // DRAFT ALGO: if TOPICS exist, take top 1-3 social_tag as master topic(s)
  //      then consider "munging" topics together transparentaly, i.e. "gender & education" == "feminism" == "third-wave feminism"
  //      i.e. need to somehow "simplify" the plethora of social tags that are coming back, so that we can somehow accrue points
  //      in a consistent way; instinctivly, this feels a bit like keeping top 2-3 topics per session, and matching subsequent
  //      sessions on all matching topics, but only displaying one of the topics in the topic-set as a "UI hack" --
  //      e.g. "feminism" is the display-name to to represent {"gender & education" == "feminism" == "third-wave feminism"...)
  //      i.e. simplisft representation of multiple items in a topic-set. so if subsequent session returns "gender & education" alone,
  //      we already know this is part of a topic-set with a simpler display-name, so just use that...
  //
  // ******
  page_meta.title_ex_stopwords = remove_stop_words(page_meta.html_title);
  logger().info("%c html_title=" + page_meta.html_title, "color:blue");
  logger().info("%c title_ex_stopwords=" + page_meta.title_ex_stopwords, "color:blue");
  logger().info("%c og_title=" + page_meta.og_title, "color:blue");
  logger().info("%c og_image=" + page_meta.og_image, "color:blue");
  logger().info("%c og_sitename=" + page_meta.og_sitename, "color:blue");
  logger().info("%c og_type=" + page_meta.og_type, "color:blue");

  // calais topic is *very* general, probably not specific enough
  var topics = _.chain(nlp.items).where({ type: "TOPIC" }).sortBy("score").reverse().value();
  if (topics.length > 0) {
    nlp.topic_general = topics[0].name;
    topics.forEach(function (a) { logger().info("%c" + a.type + " '" + a.name + "' score=" + a.score, "background:black; color:white; font-weight:bold;") });
  } else
    logger().warn("%c ** NO CALAIS TOPICS RETURNED **", "background:black; color:red; font-weight:bold;");

  // no social tags? can't do much for now!
  if (social_tags.length == 0) {
    logger().warn("%c ** NO SOCIAL TAGS RETURNED: NOP/EXITING -- TODO: need a different way of handling these cases?... **", "background:black; color:red; font-weight:bold;");
    return nlp;
  }

  nlp.topic_specific = "?";

  //
  // *** remove social tags that are also entities -- https://www.youtube.com/watch?v=1WJyEQXZ7dY || https://www.youtube.com/watch?v=7-IOCUCDL28
  //
  var entity_names = _.chain(nlp.items).where({ type: "ENTITY" })
    .map(function (a) { return a.name; }).value();
  var dupes = _.filter(nlp.items, function (a) { return a.type == "SOCIAL_TAG" && entity_names.indexOf(a.name) != -1 });
  //nlp.items = _.difference(nlp.items, dupes);
  nlp.social_tags = _.difference(nlp.social_tags, dupes);

  // most succinct tag
  //nlp.social_tags = _.sortBy(social_tags, function (a) { return a.name.length; });
  //nlp.social_tags[0].candidate_reason += "MOST_SUCCINCT ";
  //nlp.social_tags[0].topic_specifc_score += 0.5;

  // most repeated tag, e.g. "guitar", "classical guitar", "guitars" -> guitar (take up to 3 by recurrences, score by recurrence count)
  _.forEach(nlp.social_tags, function (a) {
    var appears_in = _.filter(nlp.social_tags, function (b) { return b.name.toLowerCase().indexOf(a.name.toLowerCase()) != -1 });
    a.appearance_count = appears_in.length;
  });
  nlp.social_tags = _.sortBy(nlp.social_tags, function (a) { return a.appearance_count }).reverse();
  for (var i = 0; i < 3 && i < nlp.social_tags.length; i++) {
    var tag = nlp.social_tags[i];
    if (tag.appearance_count > 1) {
      tag.candidate_reason += " RECURRING ";
      tag.topic_specifc_score += (nlp.social_tags[i].appearance_count * 2);
    }
  }

  // tags contained in title; exact word match
  var tags_exact_title_match = _.filter(social_tags, function (a) {
    return page_meta.title_ex_stopwords.toLowerCase().indexOf(a.name.toLowerCase()) != -1;
  });
  _.each(tags_exact_title_match, function (a) {
    a.candidate_reason += " TITLE_EXACT ";
    a.topic_specifc_score += 10;
  });

  // title best partial match - e.g. https://www.youtube.com/watch?v=iVWizzs06L0
  _.each(social_tags, function (t) {
    //if (t.name == "John Carmack")
    //    logger().info("dbg");

    t.words_common_to_title = cslib_words_in_common(t.name.toLowerCase(), page_meta.title_ex_stopwords.toLowerCase());

    // any common words also in entities?
    t.words_common_to_title_and_entities = _.filter(t.words_common_to_title, function (word) {
      return _.any(entities, function (e) { return e.name.toLowerCase() == word.toLowerCase() && e.relevance > 0.5 });
    });

    // tag name common to entities, exact match?
    t.common_to_entities_exact = _.filter(entities, function (e) { return e.name.toLowerCase() == t.name.toLowerCase() && e.relevance > 0.1 });

    // boost
    t.topic_specifc_score += t.words_common_to_title.length +
      t.words_common_to_title_and_entities.length +
      t.common_to_entities_exact.length;
  });
  nlp.social_tags = _.sortBy(nlp.social_tags, function (a) { return a.words_common_to_title.length }).reverse();
  if (nlp.social_tags[0].words_common_to_title && nlp.social_tags[0].words_common_to_title.length > 0) {
    nlp.social_tags[0].candidate_reason += " TITLE_BEST_MATCH ";
    nlp.social_tags[0].topic_specifc_score += 4;
  }

  nlp.social_tags = _.sortBy(nlp.social_tags, function (a) { return a.words_common_to_title_and_entities.length }).reverse();
  if (nlp.social_tags[0].words_common_to_title_and_entities && nlp.social_tags[0].words_common_to_title_and_entities.length > 0) {
    nlp.social_tags[0].candidate_reason += " TITLE_ENTITIES_BEST_MATCH ";
  }

  nlp.social_tags = _.sortBy(nlp.social_tags, function (a) { return a.common_to_entities_exact.length }).reverse();
  _.each(nlp.social_tags, function (a) {
    if (a.common_to_entities_exact.length > 0) {
      a.candidate_reason += " TAGNAME_ENTITIES_EXACT ";
      a.topic_specifc_score += 5;
    }
  });

  // parts of speach patterns
  _.each(social_tags, function (a) {
    var sentence = window.nlp.pos(a.name).sentences[0];
    if (sentence.tokens.length == 1 && sentence.tokens[0].pos.tag == "JJ") { // e.g "astrobioliogy" classified as an adjective for som reason!
      a.candidate_reason += " POS_JJ";
      a.topic_specifc_score += 12;
    }
    if (sentence.tokens.length == 1 && sentence.tokens[0].pos.tag == "NN") { // e.g "Skyscraper"
      a.candidate_reason += " POS_NN";
      a.topic_specifc_score += 4;
    }
    if (sentence.tokens.length == 1 && sentence.tokens[0].pos.tag == "NNP") { // e.g "Amy Schumer"
      a.candidate_reason += " POS_NNP";
      a.topic_specifc_score += 3;
    }
    if (sentence.tokens.length == 2 && sentence.tokens[0].pos.tag == "JJ" && sentence.tokens[1].pos.tag == "NN") { // e.g "giant planets"
      a.candidate_reason += " POS_JJ_NN";
      a.topic_specifc_score += 11;
    }
  });

  // discount tags that are duplicates of the containing site -- these are generally non-specific and uninteresting in that context
  if (page_meta.og_sitename != null)
    _.each(nlp.social_tags, function (a) {
      if (page_meta.og_sitename.toLowerCase().indexOf(a.name.toLowerCase()) != -1) {
        a.candidate_reason += " TOO_SIMILAR_OGSITENAME ";
        a.topic_specifc_score -= 5;
      }
    });

  // dedupe candidates, sort by score
  nlp.social_tags = _.sortBy(nlp.social_tags, function (a) { return a.topic_specifc_score }).reverse();

  //
  // TODO NEXT: want to group results by "clouds" of tags, i.e. auto-group two or more tags...
  //
  //   * this is a *DYNAMIC* grouping ... the SINGLE TITLE of the entire group should be the common
  //      topic_specific that appears across all the sessions in the group...
  //
  //      so "chess" will EMERGE as the common factor in all the sessions >> EVEN THOUGH MANY OF THEM WON'T HAVE
  //      "chess" as the topic_specific (e.g. "magnus carlsen", "world chess champions", etc.)
  //
  //      >> SO DISPLAY THE SESSION_GROUP_DYNAMIC_NAME
  //          ... LIST ALL SESSIONS THAT HAVE [SESSION_GROUP_DYNAMIC_NAME] IN COMMON >> display the session [topic_specific]
  //          too; make it clickable so that sub-groupings can emerge ...
  //
  //  how to determine all distinct SESSION_GROUP_DYNAMIC_NAMEs ??
  //    >> this is a GROUPING exercise:
  //
  //      for (each session "s")
  //         get all other sessions that share ANY tags with "s" (common sessions)
  //         find the most common single tag across the common sessions
  //         tag "s" with this single most common tag (SESSION_GROUP_DYNAMIC_NAME)
  //         tag all other common sessions with the same tag?!
  //
  //  this might do for a start, but consider that a session should be able to exist in more than one common grouping
  //  e.g. "science" and "astronomy?
  //
  // CONCLUSION: too many unknowns here. JUST PUT TOGETHER ALL THE INTERACTION STUFF AND BUILD A SIMPLE HISTORY VIEW
  //             TO START WITH. LET "GROUPINGS" EMERGE OR EVOLVE AS BEST EFFORT. REMEMBER, GROUPING DOESN'T HAVE TO BE PERFECT --
  //             BUT IT NEEDS TO BE JUST GOOD ENOUGH TO BE ABLE TO INITIATE "TOPIC SHARING STREAMS" WITH FRIENDS.
  //
  // don't boil the ocean! SO BACK TO SIMPLE SESSION TRACKING AND SAVING OF SESSIONS IN LOCALSTORAGE AS NEXT STEP...
  //

  //
  // TODO: http://www.bbc.com/news/magazine-34172733
  // returns ONE single social_topic (a bad one), but a lot of entities, including some good ones.
  //  in this case (low/one social_tags returned) >> makes sense to subject ENTITIES to the treatment above...
  //  to pick the best one...
  // trying to find another example...
  //

  // decide on one!
  //var best_tag = nlp.social_tags[0];
  //var pos = window.nlp.pos(best_tag.name).sentences[0]; // pluraize singular noun
  //if (pos.tokens.length == 1 && pos.tokens[0].pos.tag == "NN" && dont_pluralize.indexOf(pos.tokens[0].text.toLowerCase()) == -1) {
  //    var n = new window.nlp.noun(pos.tokens[0].text);
  //    nlp.topic_specific = n.conjugate().plural;
  //} else
  logger().info("%c >> no_high_relevance_entities: " + no_high_relevance_entities, "background:orange; color:white;");
  logger().info("%c >> no_entities: " + no_entities, "background:orange; color:white;");
  logger().info("%c >> high_relevance_entity_ratio: " + high_relevance_entity_ratio, "background:orange; color:white; font-weight:bold;");
  if (high_relevance_entity_ratio > 0.1)
    nlp.topic_specific = nlp.social_tags[0].name;
  else
    if (nlp.social_tags[0].topic_specifc_score > 21)
      nlp.topic_specific = nlp.social_tags[0].name;
    else
      if (nlp.social_tags[0].candidate_reason.indexOf("TITLE_EXACT") != -1 ||
        nlp.social_tags[0].candidate_reason.indexOf("TITLE_BEST_MATCH") != -1)
        nlp.topic_specific = nlp.social_tags[0].name;
      else
        logger().info("%c >> high_relevance_entity_ratio LOW && no >21 entity && top entity !(TITLE_EXACT||TITLE_EXACT) -- assuming non-specific content...", "background:red; color:white; font-weight:bold;");

  // log social tags -- now ranked by perceived importance
  _.forEach(nlp.social_tags, function (a) {

    logger().info("%c" + a.type + " '" + a.name + "' " +
      " importance=" + a.importance +
      " score=" + a.topic_specifc_score +
      " reasons=" + a.candidate_reason +
      " recurs=" + a.appearance_count, "background:white; color:blue; font-weight:bold;");

    // https://github.com/spencermountain/nlp_compromise
    var sentences = window.nlp.pos(a.name).sentences;
    var pos_types = "";
    sentences.forEach(function (s) {
      s.tokens.forEach(function (t) {
        logger().info("\t" + t.text + ": " + t.pos.name + ", " + t.pos.parent + " (tense: " + t.pos.tense + ") " + t.pos.tag);
        pos_types += t.pos.tag + " ";
      })
    });

    if (a.words_common_to_title.length > 0)
      logger().info("\twords_common_to_title = '" + a.words_common_to_title + "'");
    if (a.words_common_to_title_and_entities.length > 0)
      logger().info("\twords_common_to_title_and_entities = '" + a.words_common_to_title_and_entities + "'");
  });

  // log candidate topic_specific
  //_.forEach(nlp.single_topic_candidates, function (a) {
  //    logger().info("%cCANDIDATE TOPIC '" + a.name + "'" +
  //        " score=" + a.topic_specifc_score +
  //        " reason=" + a.candidate_reason +
  //        " importance=" + a.importance +
  //        " appearance_count=" + a.appearance_count,
  //        "background:blue; color:white; font-weight:bold;");
  //});

  //logger().info("%c >> nlp.topic_specific = [" + nlp.topic_specific + "] <<", "background:green; color:white; font-weight:bold;");
  cslib_info("%c >> nlp.topic_specific (social_tags only) = [" + nlp.topic_specific + "] <<", "background:green; color:white; font-weight:bold;");

  // NLP test mode -- compare against expected; notify result
  //if (typeof nlp_test_ok1 !== 'undefined' || typeof nlp_test_ok2 !== 'undefined') {
  //    if (!nlp_test_run) {
  //        logger().info("%c >> TEST_MODE !! ok1=" + nlp_test_ok1 + " <<", "background:yellow; color:black; font-weight:bold;");
  //        logger().info("%c >> TEST_MODE !! ok2=" + nlp_test_ok2 + " <<", "background:yellow; color:black; font-weight:bold;");
  //        if (nlp.topic_specific == nlp_test_ok1 || nlp.topic_specific == nlp_test_ok2)
  //            chrome.extension.sendMessage({ "nlp_test_result": true, "result": "NLP_TEST_PASS" });
  //        else
  //            chrome.extension.sendMessage({
  //                "nlp_test_result": true,
  //                "result": "NLP_TEST_FAIL",
  //                "ok1": nlp_test_ok1,
  //                "ok2": nlp_test_ok2,
  //                "got": nlp.topic_specific
  //            });
  //        nlp_test_run = true;
  //    }
  //}

  // send NLP result to background
  dispatchDataToBg({ type: 'NLP_RESULT', payload: { url: remove_hash_url(nlp.url.href), nlp: nlp, page_meta: page_meta, } });
  return nlp;
}

function nlp_calais(page_meta, test_data, url, user_id, hash, document_head_hash) {
  var nlp_items = [];
  var nlp = null;
  var millis = new Date().getTime();
  var content_lang = "?";
  $.ajax({
    type: "POST",
    url: "https://api.thomsonreuters.com/permid/calais",
    data: test_data, // remove unicode from str, Calais doesn't like it

    //async: false,
    contentType: "text/raw",
    crossDomain: true,
    headers: {
      "X-AG-Access-Token": millis % 3 == 0 ? "BFRb8pCzYflF9ndHBGryXZXUZXAZBYXd" // dunghd.it@gmail.com
        : millis % 3 == 1 ? "tDRSzbuifZKYL2QfH2nM37vpDMiQv4sN" // a12pct@gmail.com
          : "mq9C5G9BrsS8PMEjKjR0FTnmiISABWDx" // khapcd@gmail.com
      ,
      "Content-Type": "text/raw",
      "outputformat": "application/json"
    },
    dataType: "JSON",

    success: function (o) {
      logger().warn(o);
      _.each(o, function (obj, prop_name) {
        if (obj.hasOwnProperty("_typeGroup")) {
          var type = obj._typeGroup;
          var nlp_info = null;
          switch (type) {
            case "topics":
              nlp_info = new Object();
              nlp_info.type = "TOPIC";
              nlp_info.score = obj.score;
              nlp_info.name = obj.name;
              break;

            case "language":
              nlp_info = new Object();
              nlp_info.type = "LANG";
              nlp_info.language = obj.language;
              content_lang = obj.language;
              break;

            case "socialTag":
              if (obj.name != null && obj.name != "Undefined") {
                nlp_info = new Object();
                nlp_info.type = "SOCIAL_TAG";
                nlp_info.importance = obj.importance;
                nlp_info.name = obj.name;
              }
              break;

            case "entities":
              if (obj.name != null && obj.name != "Undefined") {
                nlp_info = new Object();
                nlp_info.type = "ENTITY";
                nlp_info.entity_type = obj._type;
                nlp_info.name = obj.name;
                nlp_info.relevance = obj.relevance;
              }
              // +... persontype, nationality, confidencelevel
              break;
          }
          if (nlp_info == null) {
            ;
          } else {
            nlp_items.push(nlp_info);
          }
        }
      });

      nlp = {
        url: url, // NLP refdata
        document_head_hash: document_head_hash,
        meta: page_meta, // NLP refdata
        items: nlp_items, // NLP raw Calais
        content_lang: content_lang, // NLP lang string
        topic_general: "?", // derived/post-process data
        topic_specific: "?", // "
        social_tags: "?" // "
      };

      cslib_info(JSON.stringify(nlp, null, 2));
      // put NLP packet to DB
      ajax_put_UrlNlpInfoCalais(user_id, hash, nlp, function (data) {

        cslib_info("%c ]] ajax_put_UrlNlpInfoCalais: " + JSON.stringify(data), "color:green; font-weight:bold;");
        dispatchDataToBg({ type: 'NLP_TERMS', payload: { document_head_hash: document_head_hash, url: remove_hash_url(document.location.href), topics: data.topics, suggestions: data.suggestions } });
        dispatchDataToBg({ type: 'GENERATE_SHARE_TOPICS', payload: { url: remove_hash_url(document.location.href), topics: data.topics } });
        // TEST MODE: hit next button - or reseed if not english
        if (document.getElementById('maomao-extension-youtube-test')) {
          if (content_lang != "http://d.opencalais.com/lid/DefaultLangId/English") {
            logger().info("content_lang != ENGLISH -- reseeding...");
            if (cslib_isYouTubeSite())
              cslib_test_Reseed();
          } else cslib_test_NextYouTubeVid();
        } else {
          logger().info("Disable youtube test");
        }
      }, function (error) {
        dispatchDataToBg({ type: 'NLP_CALAIS_ERROR', payload: { url: remove_hash_url(document.location.href), error: error, } });
      });

      // post-process nlp data -- // this then becomes the reference output for the server
      calais_process(nlp); // todo: nop -- server should do this ...
    },
    error: function (jqXHR, status) {
      StackTrace.fromError(jqXHR).then(cslib_errorStack).catch(cslib_errBack);
      dispatchDataToBg({ type: 'API_CALAIS_ERROR', payload: { url: remove_hash_url(document.location.href), jqXHR: jqXHR, status: status } });
      if (jqXHR.status == 429) {
        // TODO: handle
        //Object {readyState: 4, responseText: "You exceeded the concurrent request limit for your…later or contact support to upgrade your license.", status: 429, statusText: "Too Many Requests"}
        logger().info("429 RATE LIMIT EXCEEDED! -- wait & reseeding...");

        // TEST MODE: reseed the random walk -- wait 5
        setTimeout(function () {
          if (cslib_isYouTubeSite())
            cslib_test_Reseed();
        }, 1000 * 5);
      } else if (jqXHR.status == 400) { // get this for non-english/unsupported langs
        // TEST MODE: reseed the random walk
        if (cslib_isYouTubeSite()) {
          logger().info("400 BAD REQUEST! -- reseeding...");
          cslib_test_Reseed();
        }
      }
    }
  });
  return nlp;
}

//});
