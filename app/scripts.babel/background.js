'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');


$(window).load(function(){	
	chrome.bookmarks.getTree(function (tree) {
		console.log(tree);
	});
});