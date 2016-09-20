'use strict';
//everything wrapped in a function that is called when the marks are loaded
var bookmarksLoaded = function(){
	$('#queryInput').focus();

	//OPEN LINK LISTENER for opening links in new tab through the api
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	$('body').on('click', 'a', function(){
	    chrome.tabs.create({url: $(this).attr('href')});
	    return false;
	});
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//JQuery UI code for making bookmarks sortable/draggable
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	$('#linkzTitle').draggable();
	$('#linkList').sortable();

	//set occupied to false initially so that only folders can be dropped
	var occupied = false;

	//initiates the dropzone and switches mode depending on what is dropped
	function initDropzone(id){
		console.log(occupied);
		//when folder is dropped occupied is set to true
		if(occupied === true){
			$('#folderDrop').droppable({
				// accept: 'li[data*=false]',
		      	drop: function(event, ui) {
		      		console.log(event, ui);
		      		console.log(ui.draggable[0].innerText);
		      		var props = {'height': '60px'};

		      		chrome.bookmarks.move(String(ui.draggable[0].attributes.id.value.substr(4)), {'parentId': String(id)}, function(data){
		      			console.log('moved', data);
		      		});

		        	$(this).addClass('occupied-state')
		          		// .find('span')
		            	.html(ui.draggable[0].innerText)
		            	.animate(props,2000,'easeOutQuint');
		            initDropzone();
		      	}
		    });
		} else {
			$('#folderDrop').droppable({
				accept: 'li[data*=true]',
		      	drop: function(event, ui) {
		      		console.log(event, ui);
		      		console.log(ui.draggable[0].innerText);
		      		var props = {'height': '60px'};
		        	$(this).addClass('ui-state-highlight')
		          		// .find('span')
		            	.html('<p class="folderTitle">'+ui.draggable[0].innerText+'</p>')
		            	.append('<p>drag a bookmark here to add it the folder</p>')
		            	.animate(props,2000,'easeOutQuint');
		            occupied = true;
		            initDropzone(ui.draggable[0].attributes.id.value.substr(4));
		      	} 	
		    });	

		}

	};
	initDropzone();
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


	//ADD BOOKMARK - click handler/function for adding current tab to bookmarks
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//ADD ALL LINKS - click handler/function that prompts user for name and
	//makes all current tabs a bookmark in that directory
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~





//HERE LIES THE ONLY WAY I COULD FIGURE OUT HOW TO HANDLE ALL EVENTS WITH ONE HANDLER
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Adds an event listener to the element that contains the bookmark list
	$('#linkBox').on('click', processAction);
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//Processes the event when user clicks a bookmark
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function processAction(e){
		console.log(e);
		// console.log(e.target.url, e.target.id.substr(0,3), e.target.attributes.data.value);
		if(e.target.attributes.class.value.substr(0,6) == 'delete'){
			removeBookmark(e);		
		} else if(e.target.id.substr(0,3) === 'but'){
			openAllFolderMarks(e.target.id.substr(4));
		} else if(e.target.attributes.data.value === 'true') {
			getFolderMarks(e);
		} else if(e.target.id === 'cancelRemove'){
			processCancel(e);
		} else if (e.target.id === 'confirmRemove'){
			processRemoval(e);
		} else {
			e.stopPropagation();
			return;
		}
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



	var elementId, bookmarkId, remContent;
	//processes the action of clicking remove bookmark
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function removeBookmark(e) {
		console.log('test', e, e.target);
		if (e.target.id == '') {console.log('its a link');return;}

	    if (e.target !== e.currentTarget) {

	        elementId = 'fol-'+e.target.id.substr(4);
			bookmarkId = elementId.substr(4);
			console.log(elementId, bookmarkId);
			console.log('CHECK - ');

			remContent = $('#'+elementId).children().detach();

			setTimeout(function(){
			console.log(elementId); 
				$('#'+elementId).append('<div id="confirmBox"></div>')
		
	 		}, 100);
	 		setTimeout(function(){ 
	 			console.log(elementId, bookmarkId, e.target.id.substr(4));
	 		 	$('#confirmBox').append('<input id="confirmRemove" class="btn btn-default greenHov" type="button" value="confirm" data="'+elementId+'">')
				$('#confirmBox').append('<input id="cancelRemove" class="btn btn-default" type="button" value="cancel" data="'+elementId+'">');
	 		 }, 200);
	 		// $('#'+elementId).stop().animate({height:'-=70px'},1000,'easeOutQuint', function(){
	 	 	$('#'+elementId).stop().animate({height:'+=48px'},2000,'easeOutQuint');
	 		// });

			
				// $('#confirmRemove').on('click', processRemoval(elementId, bookmarkId));
	    }
	    e.stopPropagation();
	}

	//processes the cancel remove event
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function processCancel(e){
		console.log('processCancel', elementId);
		$('#confirmBox').remove();
		$('#confirmRemove').remove();
		$('#cancelRemove').remove();
		// $('#'+elementId).parent().children().show();
		// ('#'+elementId).append(remContent);
		remContent.appendTo('#'+elementId);
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


	//DELETE A BOOKMARK - process click on confirm event 
	//(actually deletes the bookmark)
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function processRemoval(e){
			chrome.bookmarks.remove(bookmarkId, function(x){
				console.log(x);
			});
			// console.log($('#'+elementId));
			$('#'+elementId).animate({height:'-=100px'},1500,'swing',removeItem(elementId));
	}

	function removeItem(id){
		setTimeout(function(){ 
			$('#'+id).remove();
			$('#'+id).children().remove();
		 }, 1500);
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



	//GET BOOKMARKS FOR A FOLDER - (process click on folder event)
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function getFolderMarks(e) {
		// console.log('test', e, e.target);
		if (e.target.id == '') {console.log('its a link');return;}

	    if (e.target !== e.currentTarget) {
	        var folderId = e.target.id;
			// console.log(folderId, $('#'+folderId).height());

			//IF/ELSE to check if folder is open or not
			if($('#'+folderId).height() > 50){
				// console.log($('#'+folderId).height(), 'MORE THAN 50');
				var props = {'height': '58px'};
				$('#'+folderId).animate(props,1000,'easeOutQuint', removeUrls(folderId));
			} else {
				// console.log($('#'+folderId).height(), 'LESS THAN 50');
				chrome.bookmarks.getChildren(String(folderId.substr(4)), function(marks){
					// console.log(marks);
					//FOR ADDING FULL LIST ITEM INSTEAD
					// $('#'+e.target.id).append('<ul id="cool"></ul>');
					marks.forEach(function(mark){
						//ADDS FULL LIST ITEM
						// $('#cool').append('<br><li class="linkItemFolder"><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a></li>');
						//Appends an link element for each bookmark in the selected folder
						$('#'+e.target.id).append('<br><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a>');
					});
					var height = (marks.length * 20)+58+'px';

					var props = {'height': height};
					// console.log($('#'+folderId));
					$('#'+folderId).animate(props,2000,'easeOutQuint');
				});
			}

	    }
	    e.stopPropagation();
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


	//HIDE BOOKMARKS FOR FOLDER - (processes click on open folder)
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function removeUrls(id){
		setTimeout(function(){ 
			$('#'+id).children('a').remove();
			$('#'+id).children('br').remove();
		}, 1000);
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//OPEN ALL BOOKMARKS FOR FOLDER - (processes click on open all button)
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function openAllFolderMarks(id){

		chrome.bookmarks.getChildren(String(id), function(marks){
			// console.log(marks);
			marks.forEach(function(mark){
				console.log(mark.url);
				chrome.tabs.create({url: mark.url});
			});
		});
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


};//END OF WRAPPING FUNCTION
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~







