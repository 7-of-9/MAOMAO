
//
// Static Data
//

// Map of query parameter words to sounds.
var searchSounds = {
  'scotland': 'bagpipe.mp3',
  'seattle': 'rain.mp3',
};

// Map of tab numbers to notes on a scale.
var tabNoteSounds = {
  'tab0': 'mando-1.mp3',
  'tab1': 'mando-2.mp3',
  'tab2': 'mando-3.mp3',
  'tab3': 'mando-4.mp3',
  'tab4': 'mando-5.mp3',
  'tab5': 'mando-6.mp3',
  'tab6': 'mando-7.mp3',
};

// Map of sounds that play in a continuous loop while an event is happening
// in the content area (e.g. 'keypress' while start and keep looping while
// the user keeps typing).
var contentSounds = {
  'keypress': 'typewriter-1.mp3',
  //'resize': 'harp-transition-2.mp3',
  'scroll': 'shepard.mp3',
  'click': 'click.mp3',
};

// Map of events to their default sounds
var eventSounds = {
  'tabCreated': 'conga1.mp3',
  'tabMoved': 'bell-transition.mp3',
  'tabRemoved': 'smash-glass-1.mp3',
  'tabSelectionChanged': 'click.mp3',
  'tabAttached': 'whoosh-15.mp3',
  'tabDetached': 'sword-shrill.mp3',
  'tabNavigated': 'click.mp3',
  'windowCreated': 'bell-small.mp3',
  'windowFocusChanged': 'click.mp3',
  'bookmarkCreated': 'bubble-drop.mp3',
  'bookmarkMoved': 'thud.mp3',
  'bookmarkRemoved': 'explosion-6.mp3',
  'windowCreatedIncognito': 'weird-wind1.mp3',
  'startup': 'whoosh-19.mp3',
};

// var soundLists = [searchSounds, eventSounds, tabNoteSounds,
//     contentSounds];
// dunghd fix: Only play sounds for startup
var soundLists = [{ 'startup': 'whoosh-19.mp3', }];

var sounds = {};

// Map of event names to extension events.
// Events intentionally skipped:
// chrome.windows.onRemoved - can't suppress the tab removed that comes first
var extensionEvents = {
  'tabCreated': chrome.tabs.onCreated,
  'tabMoved': chrome.tabs.onMoved,
  'tabRemoved': chrome.tabs.onRemoved,
  'tabSelectionChanged': chrome.tabs.onSelectionChanged,
  'tabAttached': chrome.tabs.onAttached,
  'tabDetached': chrome.tabs.onDetached,
  'tabActivated': chrome.tabs.onActivated,
  'tabNavigated': chrome.tabs.onUpdated,
  'windowCreated': chrome.windows.onCreated,
  'windowRemoved': chrome.windows.onRemoved,
  'windowFocusChanged': chrome.windows.onFocusChanged,
  'bookmarkCreated': chrome.bookmarks.onCreated,
  'bookmarkMoved': chrome.bookmarks.onMoved,
  'bookmarkRemoved': chrome.bookmarks.onRemoved,
};


///////////////////////////////////////////
// whitelist for processing
//
//var ignore_urls_exact = [
//    'https://www.facebook.com/',
//    'https://www.youtube.com/',
//];
var ignore_urls_starting_with = [
  'https://www.facebook.com/photo.php?',
  'https://www.facebook.com/home.php',

  //         'https://www.google.',

  'https://www.youtube.com/feed/history',
  'https://www.youtube.com/results',
];
var ignore_urls_regex = [
  /facebook.com\/.*photos/i
];
function process_url(url) {
  // sanity
  if (url == null) return false;
  if (url.indexOf('http:') != 0 && url.indexOf('https://') != 0) return false;

  // don't process 'top level' URLs, e.g. 'www.facebook.com' or 'www.quora.com' -- these
  // almost certainly won't contain topic-specific content; rather, they'll be aggregates of lots of different topics
  //if (ignore_urls_exact.indexOf(url) != -1) return false;
  var parsed_url = new URL(url);
  if (parsed_url.pathname == null || parsed_url.pathname == '' || parsed_url.pathname == '/')
    return false;

  // specific exclusions -- probably best done at server?
  if (_.any(ignore_urls_starting_with, function (a) { return url.indexOf(a) == 0; })) return false;
  if (_.any(ignore_urls_regex, function (a) { return a.test(url) == true; })) return false;
  return true;
}

///////////////////////////////////////////
// test URLs for NLP
//
var nlp_tests = [
  {
    url: 'https://www.youtube.com/watch?v=qLF5VAelpmM',
    ok1: 'Amy Schumer'
  }

  , {
    url: 'http://www.theguardian.com/lifeandstyle/the-running-blog/2015/sep/11/how-i-ran-a-half-marathon-on-sealand-the-fortress-nation-in-the-middle-of-the-sea?CMP=fb_gu',
    ok1: 'Sealand'
  }

  // long text, abstract hard
  , {
    url: 'https://developer.chrome.com/extensions/messaging',
    ok1: ''
  }

  // no description, comments very tangential!
  // tags badly: '9' (should trivially reject: ordinal, low length) or 'inner core'
  //   * very few social_tags returned (1/2) -- reject / fallback to differnet algo when low # of social_tags?
  //   * no calais topics returned (but are in calais demo viewer) -- why?
  //   * could use entities as fallback for social tags?
  //
  , {
    url: 'https://www.youtube.com/watch?v=BsKyEckDRbo',
    ok1: ''
  }

  // long text, tags badly
  , {
    url: 'http://techcrunch.com/2015/09/11/legendary-productivity-and-the-fear-of-modern-programming/',
    ok1: ''
  }

  // dumb-text parser can't understand what is article text and what is background text
  // http://order-order.com/2015/09/07/tory-tech-dragon-charged-with-child-sex-offences/#:QbupQZNu2gdMEA
  // could use mouse hover interactions to pick out correct div ?! seems very hard.
];
