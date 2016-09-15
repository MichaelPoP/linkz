'use strict';

var bookmarksLoaded = function(){

	// $(window).load(function(){	
		// console.log('check');
		// chrome.bookmarks.getTree(function (tree) {
		// 	console.log(tree);
		// });
	// });
		//Listener for opening links in new tab through the api
   $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });




	//Add link button logic
	$('#addLink').on('click', function(){
		console.log('adds link..');
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			console.log(tabs);
		    var url = tabs[0].url;
		    console.log(url);

		    var bookmark = new Object();
		    bookmark.title = tabs[0].title;
		    bookmark.url = tabs[0].url;

		    chrome.bookmarks.create(bookmark, function(data){
		    	console.log(data);
		    });
		});

	});


	//ADD ALL LINKS
	$('#addAll').on('click', function(){
		console.log('adds lots of links..');
		chrome.tabs.query(function (tabs) {
			console.log(tabs);
		    var url = tabs[0].url;
		    console.log(url);

		    var bookmark = new Object();
		    bookmark.title = tabs[0].title;
		    bookmark.url = tabs[0].url;

		    chrome.bookmarks.create(bookmark, function(data){
		    	console.log(data);
		    });
		});

	});


	//REMOVE SPECIFIC LINK
	$('#linkBox').on('click', removeBookmark);

	function removeBookmark(e) {
		console.log('test', e, e.target);
		if (e.target.id == '') {console.log('its a link');return;}

	    if (e.target !== e.currentTarget) {
	        var elementId = e.target.id;

			console.log(elementId);
			var bookmarkId = elementId.substr(4);
			console.log(bookmarkId);

			chrome.bookmarks.remove(bookmarkId, function(x){
				console.log(x);
			});
	    }
	    e.stopPropagation();
	}

}







