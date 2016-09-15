'use strict';

var bookmarksLoaded = function(){
	$('#queryInput').focus();

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
		var folderName = prompt('Name the folder.');
		chrome.tabs.query({'lastFocusedWindow': true}, function (tabs) {
			console.log(tabs);

			var folder = new Object();
			folder.title = folderName;

		    chrome.bookmarks.create(folder, function(data){
		    	console.log(data);
		    	console.log(data.id);
		    	addTabs(data.id);
		    });

		    function addTabs(folderId){
		    	var folderId = folderId;
		    	tabs.forEach(function(tab){
		    		console.log(tab.id);
		    		var bookmark = new Object();
		    		bookmark.parentId = folderId;
		    		bookmark.title = tab.title;
		    		bookmark.url = tab.url;
		    		console.log(bookmark);
		    		chrome.bookmarks.create(bookmark, function(data){
		    			console.log(data);
		    		})
		    	})
		    }

		});

	});


	//Adds an event listener to the element that contains the bookmark list
	$('#linkBox').on('click', processAction);

	//Processes the event when user clicks a bookmark
	function processAction(e){
		// console.log(e.target.url, e.target.id.substr(0,3), e.target.attributes.data.value);
		if(e.target.url){
			removeBookmark(e);		
		} else if(e.target.id.substr(0,3) === 'but'){
			openAllFolderMarks(e.target.id.substr(4));
		} else if(e.target.attributes.data.value === 'true') {
			getFolderMarks(e);
		}
	}

	//processes the action of clicking remove bookmark
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
			// console.log($('#'+elementId));
			$('#'+elementId).parent().animate({height:'-=58px'},1500,'swing',removeItem(elementId));

	    }
	    e.stopPropagation();
	}

	function removeItem(id){
		setTimeout(function(){ 
			$('#'+id).parent().remove();
			$('#'+id).parent().children().remove();
		 }, 1500);
	}

	$('.linkItem').on('mouseover', function(){
		console.log('test');
	});



	//GET BOOKMARKS FOR A FOLDER
	function getFolderMarks(e) {
		// console.log('test', e, e.target);
		if (e.target.id == '') {console.log('its a link');return;}

	    if (e.target !== e.currentTarget) {
	        var folderId = e.target.id;
			// console.log(folderId, $('#'+folderId).height());

			if($('#'+folderId).height() > 50){
				// console.log($('#'+folderId).height(), 'MORE THAN 50');
				var props = {'height': '58px'};
				$('#'+folderId).animate(props,1000,'swing', removeUrls(folderId));
			} else {
				// console.log($('#'+folderId).height(), 'LESS THAN 50');
				chrome.bookmarks.getChildren(String(folderId.substr(4)), function(marks){
					// console.log(marks);
					//FOR ADDING FULL LIST ITEM INSTEAD
					// $('#'+e.target.id).append('<ul id="cool"></ul>');
					marks.forEach(function(mark){
						//ADDS FULL LIST ITEM
						// $('#cool').append('<br><li class="linkItemFolder"><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a></li>');
						//JUST ADDS URLS
						$('#'+e.target.id).append('<br><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a>');
					});
					var height = (marks.length * 20)+58+'px';

					var props = {'height': height};
					// console.log($('#'+folderId));
					$('#'+folderId).animate(props,2000,'swing');
				});
			}

	    }
	    e.stopPropagation();
	}

	function removeUrls(id){
		setTimeout(function(){ 
			$('#'+id).children('a').remove();
			$('#'+id).children('br').remove();
		}, 1000);
	}

	function openAllFolderMarks(id){

		chrome.bookmarks.getChildren(String(id), function(marks){
			// console.log(marks);
			marks.forEach(function(mark){
				console.log(mark.url);
				chrome.tabs.create({url: mark.url});
			});
		});
	}



};//END OF WRAPPING FUNCTION







