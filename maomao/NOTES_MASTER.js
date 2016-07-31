// TODO NEXT
//
//   * session persistance -- want SYNC, need DB! -- API: node.js?? >> wait for bizspark feedback at least
//     >>> next: fix comments off-screen load waiting...
//
// TODO:
// ENHANCE NLP --> add AlchemyAPI (so Calais + Alchemy: model needs to "flatten" these two sources somehow)
//  * THEN: E2E testing on sustained browsing experience (across all sites)
//  * THEN: ...
//
//   * dynamic GROUPING algo...
//     on homepage -- topic groupings, with discoverability points ("have you seen?") 
//     and sharing of topics with specific friends
//
// MORE NLP libs: http://faganm.com/blog/2010/01/02/1009/
// Yahoo: Term Extraction
// OpenCalais: API
// BeliefNetworks: Recommend Concepts
// OpenAmplify: API
// AlchemyAPI: Named Entity Extraction
// Evri: REST API: Get entity network about some text
//  

//
// ... .py serverside JusText thru IronPython?
// but also need to handle on client-side, e.g. YouTube
//  so, client would need to be able to pass (waited, comments) text into server: but this is effectively "perfect" text cleaning, totally optimized to a single site.
//  cleaner/better to have client-side justext implementation? this looks like a lot of work.
//  maybe just get moving with a slightly better dumb-text handler, and live with that for now.
//
// so, if no justext immediate requirement... most effecient (from network pov) architecture is surely for clients to dispatch
// direct NLP calls and to update the server. this also has security/privacy virtues (no user html is sent to the server) and also reduces load on the server.
//
// so, hinges on ability to easily update clients: seems to be quite possible, even when "self-hosting", Chrome checks "every few hours"
//  https://developer.chrome.com/extensions/autoupdate
//
//

//
// TODO: WANT!!! single-click "COMMENT" ablitity on a video, e.g. 
//      "https://www.youtube.com/watch?v=nXk4gxcjVr8"
//
// --> "lol joe satch is DEEP, been playing all these years can't play a note"
//   kind of part of an "instant share" paradigm ... 
//   even simple maomao share with comment / tags; share direct to FB ?!
//

//
// TODO: https://aws.amazon.com/awis/ -- use Alexa API to maintain top 500 sites globally by category
//      whitelist appropiate sites, blacklist inappropriate, e.g. porn, banking, anything sensitive.
//

// ------

//
// TODO:: GET ONTO VALUE-PROP TEST AS FAST AS POSSIBLE!
//             
// MAYBE ...
// CLEAREST SINGLE USER VALUE PROP -- may be as simple as comparing quora-type SUBJECTS and EXPERIENCE POINTS
//  with friends; e.g. who knows the most about SUPERCARS, who knows the most about CHESS, etc.
//  it really means that sessions need to be TODO: BOILED DOWN to a SINGLE overarching TOPIC
//  the relative frequencies etc. of all words in the session is maybe a refinment to that, e.g.
//  TOPIC=CHESS, session focus=magnus carlson, ruy lopez, etc.
//  TOPIC=ASTRONOMY, session focus=black holes
//
// so; TODO: MUST PREFERANTIALLY PARSE TITLE, HEAD, KEYWORDS, ETC. to get top 1 or top 3 TOPICS for a given session...
// then just persist session all_text + keywords + interaction metrics into an "enhanced personal history"
//
// then really, I'd like to see all my TOPIC sessions TODO: grouped together,  with an option to send ALL
// my high-weighted sessions to a friend in bulk ... that makes a lot of sense; individual friends will share an 
// interest in a specific topic :: 
//
// TODO: >>> FULL SCREEN (RAPID) ANIMATION (BACKGROUND FADED) : "ASTRONOMY +10 XP ... 110" <<<
//
// THE HOOK: could be as simple as "gamifying the browsing experience" -> I build up EXPERIENCE POINTS or a SCORE
// for a given TOPIC after interacting with a page sufficiently, e.g. I read about black holes, I get +10 to
// my ASTRONOMY score. 
// 
// the +10 should be weighted by my interaction and the degree and complexity of the page itself...
//
// my HOMEPAGE should show what I "earned" for each session
//

// TODO: do *not* burn time reinventing wheels and trying to solve deep NLP problems;
// TODO: instead, leverage what is well understood and viable for a PoC: use OpenCalais or similar
//        for simple "category" / topic extraction from text -- no need for anything more fancy!
//        at least, suck *that* and see -- forget JS NLP engines for now, they are much too deep for PoC
// TODO: remember, no points for burning time -- getting to VALUE PROP TEST as *fast* as possible is what matters

// TODO: ...
// *simply* combining a Calais search with full text scrape and then looking at the Calais
// entities, people and topics returned could be of great interest.
//  e.g. "people you might be interested in" -> displays google-type bio-summary data for calais people
//       "topics of interest" -> with sorted session stats and send to friends ... and SCORES!!
//       "companies/places of interest" -> wikipedia links
// really, a "google-powered" STUFF OF INTEREST / DISCOVERY HOMEPAGE ... could be relatively easy to piece
// together based on a fairly naive mashup of OpenCalais vs. interaction weighting vs. POWER OF GOOGLE
// ...

/* 
star rating system, brief popup after each page (with or without keywords)
then show stars on google search results: to remind on previously viewed pages
*/