// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function playSound(id) {
  console.log(id);
  chrome.extension.getBackgroundPage().playSound(id, false);
}

function stopSound(id) {
  chrome.extension.getBackgroundPage().stopSound(id);
}

function soundChanged(event) {
  var key = event.target.name;
  var checked = event.target.checked;
  if (checked) {
    localStorage.setItem(key, "enabled");
    playSound(event.target.name);
  } else {
    localStorage.setItem(key, "disabled");
    stopSound(event.target.name);
  }
}

function showSounds() {
  var sounds = document.getElementById("sounds");
  if (!localStorage.length) {
    sounds.innerText = "";
    return;
  }
  sounds.innerText = "Discovered sounds: (uncheck to disable)";
  var keys = new Array();
  for (var key in localStorage) {
    if(key.indexOf('firebase') === -1 && key.indexOf('redux') === -1) {
      keys.push(key);
      console.log(key);
    }
  }
  keys.sort();
  for (var index in keys) {
    var key = keys[index];
    var div = document.createElement("div");
    var check = document.createElement("input");
    check.type = "checkbox"
    check.name = key;
    check.checked = localStorage[key] == "enabled";
    check.onchange = soundChanged;
    div.appendChild(check);
    var text = document.createElement("span");
    text.id = key;
    text.innerText = key;
    text.className = "sound";
    text.onclick = function(event) { playSound(event.target.id); };
    div.appendChild(text);
    sounds.appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', showSounds);
document.addEventListener('focus', showSounds);

/// ----

//var test_data = "The 7 Most Amazing Chess Records \
//    pete  | Sep 7, 2015 | 9555 views  | 33 comments \
//    Share on favoritesShare on twitterMore Sharing Services \
//    Chess is a game with a long history and many more statistics and records than there are squares on the board. \
//    Chess fans have been fervently compiling facts and numbers on the game, inspired by the truth that unlike so many other competitive pursuits, the rules of chess have remained largely the same for centuries.  \
//    Here are a few of the most amazing feats in the chess record books. For more chess records, take a look at the list at Wikipedia.  \
//    Let us know your favorite chess records in the comments or on Facebook. \
//    You might think this award could go to Fabiano Caruana and his 2014 Sinquefield Cup (we'll get to him later), but for true dominance of super-GM peers, nothing beats Garry Kasparov's obliteration of the field at the 2001 Linares tournament. \
//    Kasparov not only won the tournament by three clear points and was undefeated, but he was the only player in the field to have a positive score. Every other player in the tournament -- Polgar, Karpov, Leko, Shirov, and Grischuk -- finished shared second through sixth at 4.5/10. \
//    Don't believe it? Check out the final standings of the tournament, courtesy of Wikipedia.";

//nlp_calais(test_data);
