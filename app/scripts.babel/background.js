'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({text: '+'});

// chrome.browserAction.setBadgeBackgroundColor({ color: [200, 200, 200, 1] });

// console.log('\'Allo \'Allo! Event Page for Browser Action');


// $(window).load(function(){	
// 	chrome.bookmarks.getTree(function (tree) {
// 		console.log(tree);
// 	});
// });

/**
 * Returns a handler which will open a new window when activated.
 */
function getClickHandler() {
  return function(info, tab) {
  	console.log(info, tab);

    // The srcUrl property is only available for image elements.
    var url = '../imageinfo/info.html#' + info.srcUrl;

    // Create a new window to the info page.
    chrome.windows.create({ url: url, width: 520, height: 660 });
  };
};

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  'title' : 'Add to Linkz',
  'type' : 'normal',
  'contexts' : ['image'],
  'onclick' : getClickHandler()
});