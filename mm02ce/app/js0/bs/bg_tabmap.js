
//
// Map of Tabs
//


// https://developer.chrome.com/extensions/tabs#type-Tab
var tabmap = [];

function get_tab(tabId) {
    for (var i = 0; i < tabmap.length; i++) {
        var tab = tabmap[i];
        if (tab.id === tabId)
            return tab;
    }
    return null;
}

// https://developer.chrome.com/extensions/tabs#method-query
function update_tabmap(callback) {
    tabmap = [];
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if (!_.any(tabmap, function (a) { return a.id == tab.id; }))    
                tabmap.push(tab);
        }
        console.info("TABMAP: " + tabmap.length + " tab(s) known.");
        if (callback)
            callback();
    });
}
