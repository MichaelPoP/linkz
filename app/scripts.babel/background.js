'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

//These scripts update the browser action button with a badge depending on
//if the active page is bookmarked

//listen for new tabs opening
chrome.tabs.onCreated.addListener(function(tab) {         
  checkIfTabIsBookmark(tab);
});
//listen for updates in the current tab url
chrome.tabs.onUpdated.addListener(function(tab) {
  checkIfTabIsBookmark(tab);
});
//listen for newly activated tabs
chrome.tabs.onActivated.addListener(function(tab) {
  checkIfTabIsBookmark(tab);
});

function checkIfTabIsBookmark(tab) {
  chrome.tabs.query({'active': true, 'currentWindow':true}, function (tabs) {
    chrome.bookmarks.search({'url': tabs[0].url}, function (result){
      // console.log(result);
      if (result.length > 0){
        // chrome.browserAction.setBadgeText({text: '★'});
        chrome.browserAction.setBadgeText({text: String(result.length)});
        // chrome.browserAction.setBadgeBackgroundColor({ color: [255, 200, 20, 1] });
      } else {
        chrome.browserAction.setBadgeText({text: ''});
      }
    });

  });
}


// Returns a handler which will open a new window when activated.

function getClickHandler() {
  return function(info, tab) {
  	console.log(info, tab);

    // The srcUrl property is only available for image elements.
    var url = '../imageinfo/info.html#' + info.srcUrl;

    // Create a new window to the info page.
    chrome.windows.create({ url: url, width: 520, height: 660 });
  };
};


// Create a context menu which will only show up for images.

chrome.contextMenus.create({
  'title' : 'Add to Linkz',
  'type' : 'normal',
  'contexts' : ['image'],
  'onclick' : getClickHandler()
});