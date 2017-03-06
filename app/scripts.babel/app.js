'use strict';
//NEED TO GET RID OF SET_TIMEOUT, NEED TO SPLIT INTO MORE FUCNTIONS
//NEED TO TURN MORE PARTS INTO DIRECTIVES/COMPONENTS (sometimes directives suck)
var linkzApp = angular.module('linkzApp', ['ngRoute', 'linkzApp.directive', 'linkzApp.service']);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
linkzApp.controller('listCon', function listCon($scope) {

$('#container').imagesLoaded().fail( function( instance ) {});

	var allAboard = false;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_//
//function called when all the bookmarks have been fetched to prevent all sorts
//of errors, but ideally this would be in a component fetching from a service
	$scope.bookmarksLoaded = function($scope, timeE) {
		console.log('bookmarks loaded in[  '+ timeE +'  ]ms...');
		$( document ).ready(function() {
    		console.log( 'ready!' );
		});
		allAboard = true;
		$('#queryInput').focus();

		//OPEN LINK LISTENER for opening links in new tab through the api
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('body').on('click', 'a', function(){
		    chrome.tabs.create({url: $(this).attr('href')});
		    return false;
		});
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		//JQuery UI code for making bookmarks SORTABLE/DRAGGABLE
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('#linkList').sortable();


		//set occupied to false initially so that only folders can be dropped
		var occupied = false;
		var contents;

		//initiates the dropzone and switches mode depending on what is dropped
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function initDropzone(id){
			console.log(occupied, id);
			//when folder is in dropzone occupied is true, links and folders can be dropped
			//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			if(occupied === true){
				$('#folderDrop').droppable({
					//for accepting only bookmarks
					accept: 'li[data*=false], li[data*=true]',
					// accept: 'li',
					tolerance: 'touch',
			      	drop: function(event, ui) {
			      		console.log(event, ui, ui.draggable[0].innerText);
			      		var folderId = id;

			      		// checks if dropped item is link or folder 
						if(ui.draggable[0].attributes.data.value === 'false'){
							// if its a link then go ahead and move it

							var props1 = {color:'hex(#1BDC35)',borderColor:'hex(#1BDC35)'};
							console.log('Dragger ID: ',String(ui.draggable[0].attributes.id.value.substr(4)));
							console.log('Folder ID: ', folderId);


							//here the dropped link is actually moved to folder
							chrome.bookmarks.move(String(ui.draggable[0].attributes.id.value.substr(4)), {'parentId': String(folderId)}, function(data){
								console.log('MOVED > ', data);
							});

							$('#folderDrop').children().addClass('hide-class');

							$('#folderDrop')
								.addClass('moving-state')
									// .find('span')
								.append('<p id="droppedMark">'+ui.draggable[0].innerText+'</p>')
								.animate(props1,1000,'easeOutQuint');
								setTimeout(function(){ 
									// var props = {'background': '#93DDF1'};
									var props2 = {color:'hex(#000)', borderColor:'hex(#05B6FF)'};
									var remProps = {'opacity': 0};
									$('#droppedMark').remove().animate(remProps, 1000, 'easeOutQuint');
									$('#folderDrop').children().removeClass('hide-class');
									$('#folderDrop').removeClass('moving-state').addClass('occupied-state');
									// console.log($contents);
									// contents.appendTo('#folderDrop');
									$('#folderDrop').animate(props2, 1000, 'easeOutQuint');
								}, 2500);
							initDropzone(folderId);

						} else {
							// if it is another folder we need to update the title and re-initialize the dropzone
							occupied = true;
							$(this).html('<p class="folderTitle">drag links to add to folder: '+ui.draggable[0].title+'</p>')
							initDropzone(ui.draggable[0].attributes.id.value.substr(4));
						}
			      	}
			    });
			} else {
				//when nothing is in dropzone, occupied is false, only folders can be added
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				$('#folderDrop').droppable({
					accept: 'li[data*=true]',
					tolerance: 'touch',
			      	drop: function(event, ui) {
			      		console.log(event, ui, ui.draggable[0].textContent);
			      		var props = {'height': '44px', 'width':'432px',backgroundColor:'hex(#FFF)',color:'hex(#000)',borderColor:'hex(#05B6FF)'};
			        	$(this)
			        		.addClass('occupied-state')
			        		.removeClass('dropBox')
			          		// .find('span')
			            	.html('<p class="folderTitle">drag links to add to folder: '+ui.draggable[0].title+'</p>')
			            	// .append('<p>title: '+ui.draggable[0].title+'</p>')
			            	.animate(props,1000,'easeOutQuint');
			            occupied = true;
			            initDropzone(ui.draggable[0].attributes.id.value.substr(4));
			      	} 	
			    });	

			}

		};
		initDropzone();
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		function disableAddButtons(){
			toggleAddbuttonStyle();
    		$('#addLink').prop('disabled', true);
    		// $('#addLink').removeClass('raised')
    		$('#addAll').prop('disabled', true);	
		}
		function enableAddButtons(){
			toggleAddbuttonStyle();
	    	$('#addLink').prop('disabled', false);
    		$('#addAll').prop('disabled', false);		
		}

		function toggleAddbuttonStyle(){

			var addLink = $('#addLink');
			if(addLink.hasClass('raised')){
			 	addLink.removeClass('raised').addClass('nope');			
			} else {
				addLink.removeClass('nope').addClass('raised');
			}


			var addAll = $('#addAll');
			if(addAll.hasClass('raised')){
			 	addAll.removeClass('raised').addClass('nope');
			} else {
				addAll.removeClass('nope').addClass('raised');
			}

		}



		//remove the success alert for adding links and folders
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function removeAlert(){
			// console.log($('#alertBox'), $('#alertBox').children());
			$('#alertBox').addClass('hide-class');
			$('#alertBox').children().remove();
			$('#alertBox').css('height', '26px');
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		// $('#queryInput').on('keyup change', function(e){
		// 	console.log('input changes');
		// 	folderMod();
		// });

		//ADD BOOKMARK - click handler/function for adding current tab to bookmarks
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('#addLink').on('click', function(e){
			// $scope.linkDest 
			disableAddButtons();
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				console.log(tabs);
			    var url = tabs[0].url;
			    var title = tabs[0].title;
			    console.log(url, title);

			    $('#linkNameInput').val(title);
			    $scope.currUrl = url;
			    console.log(url, $scope.currUrl, title, $scope.currTitle);

			});

			//filter the results by folder
			$('#folderCheckbox').prop('checked', true);
			$scope.checkboxModel = { value: true };
			$scope.$apply();

			folderMod();
			$scope.folderMod = { value: true };

			$('#linkNameInput, #linkNameSubmit, #linkDestInput, #linkNameCancel').removeClass('hide-class');
			$('#linkNameInput').focus();
			$('#addBox').removeClass('hide-class');
			// $('#addFormBox').removeClass('hide-class');
			$('#addBox').stop().animate({height:'+=67px'},300,'easeOutQuint', function(){$('#addFormBox').removeClass('hide-class');});
			// $('#addBox').stop().animate({height:'+=67px'},600,'easeOutQuint');
		});

		function folderMod(){
			var onlyFolders = $scope.folders;
			console.log(onlyFolders);
			onlyFolders.forEach(function(f){
				console.log(f);
				$('#but-'+f.id).val('add');
				$('#but-'+f.id).addClass('addto');
				// $('#fol-'+f.id).append()
			});			
		}

		var linkDest = '';
		function pickDestFolder(id){
			console.log(id);
			linkDest = id.substr(4);
			console.log(linkDest);
			var desTitle = $('#tit-'+linkDest).text();
			// desTitle = 'Add to: '+desTitle;
			$('#destFolderName').text(desTitle);
			console.log(desTitle);

		}

		function onSuccess(desTitle, newLinkData){
			console.log('TITLE: '+desTitle, newLinkData);
			// $('#linkDestInput option:selected').text()
	    	$('#alertBox').append('<p class="success1Link title">'+newLinkData.title.substr(0,60)+'</p><p class="success1Link urlAdded">'+newLinkData.url.substr(0,58)+'</p><p class="success1Link destAdded">Added to: '+desTitle+'</p>');
	    	setTimeout(function(){ 
	    		removeAlert(); 
	    		enableAddButtons();
		    	$('#folderCheckbox').prop('checked', false);
				$scope.checkboxModel = { value: false };
				$scope.$apply();
	    	}, 2400);			
		}

		function addBoxRemove(data, linkCreated){
	    	console.log(data);
	    	var newLinkData = data;
	    	$('#destFolderName').text('');
	    	console.log(new Date(newLinkData.dateAdded));
			$('#linkNameInput, #linkNameSubmit, #linkDestInput').addClass('hide-class');
			$('#addBox').animate({height:'-=67px'},500,'easeOutQuint');
			$('#addBox').addClass('hide-class');
			$('#addFormBox').addClass('hide-class');

			var onlyFolders = $scope.folders
			onlyFolders.forEach(function(f){
				console.log(f);
				$('#but-'+f.id).val('open all');
				$('#but-'+f.id).removeClass('addto');
			});
			$scope.folderMod = { value: false };

			if(!linkCreated){
				enableAddButtons();
			}

			if(linkCreated){
				$('#alertBox').addClass('alert-suxess');
				$('#alertBox').removeClass('hide-class');
				$('#alertBox').stop().animate({height:'+=50px'},500,'easeOutQuint');
				enableAddButtons();					

		    	chrome.bookmarks.get(data.parentId, function(data){
		    		console.log(data[0].title);
		    		var desTitle = data[0].title;
		    		onSuccess(desTitle, newLinkData);
		    	});
			}


		}


		function saveLink(e){
			console.log(e);
			var linkName = $('#linkNameInput').val();
			// var linkDest = $('#linkDestInput').val();
			var scopeDest = linkDest;
			console.log(linkName, linkDest);
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				console.log(tabs);

			    var bookmark = new Object();
			    bookmark.parentId = newLinkDest || linkDest || '1';
			    bookmark.title = linkName || tabs[0].title;
			    bookmark.url = tabs[0].url;
			    console.log(bookmark, bookmark.parentId, bookmark.title, bookmark.url);

			    chrome.bookmarks.create(bookmark, function(data){
			    	var linkCreated = true;
			    	addBoxRemove(data, linkCreated);
			    });
			});
		}

		$('#linkNameSubmit').on('click', saveLink);
		$('#linkNameCancel').on('click', {linkCreated: false}, addBoxRemove);


		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//ADD ALL LINKS - click handler/function that prompts user for name and
		//makes all current tabs a bookmark in that directory
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		var showPrompt = false;
		//processes clicking the add all button and displays the name input form
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		$('#addAll').on('click', function(){
			disableAddButtons();
			// var folderName = prompt('Name the folder.');
			$('#folderNameInput').removeClass('hide-class').focus();
			$('#folderNameSubmit').removeClass('hide-class');
			$('#folderNameCancel').removeClass('hide-class');
			$('#folderBox').removeClass('hide-class');
			$('#folderBox').stop().animate({height:'+=48px'},1000,'easeOutQuint');
		});

		//after choosing folder name user clicks submit or cancel
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		$('#folderNameSubmit').on('click', saveFolder);
		$('#folderNameCancel').on('click', folderBoxRemove)

		function folderBoxRemove(){
    		$('#folderBox').animate({height:'-=48px'},1000,'easeOutQuint');
    		$('#folderBox').addClass('hide-class');
    		enableAddButtons();
		}

		function saveFolder(){
			var folderName = $('#folderNameInput').val();
			//queries currently open tabs & sets equal to tabs
			chrome.tabs.query({'lastFocusedWindow': true}, function (tabs) {
				console.log(tabs);

				var folder = new Object();
				folder.title = folderName;
				var height = (tabs.length * 20)+48+'px';
				var props = {'height':height};

				//creates folder object and adds tabs to it
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			    chrome.bookmarks.create(folder, function(data){
			    	console.log(data);
			    	$('#alertBox').removeClass('hide-class');
			    	if(data){
			    		$('#alertBox').addClass('alert-suxess');
			    		//tabs are added here passing in the folder Id
			    		addTabs(data.id);
			    	} else {
			    		$('#alertBox').addClass('alert alert-danger');
			    	}
 
						folderBoxRemove();
			    		
			    		$('#alertBox').stop().animate(props,1000,'easeOutQuint');
			    		// {height:'+=48px'}
			       	
			    });


			    //loops through tabs and creates bookmarks in the given folder
			    //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
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
			    			console.log('bms create: ', data);
			    			$('#alertBox').append('<p class="successLinks">'+data.title.substr(0,60)+'</p>');

			    		});
			    	});
			    	setTimeout(function(){ 
			    		removeAlert();
						enableAddButtons();
			    	}, 2400);
			    }

			});

		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		//CREATE NEW FOLDER FOR NEW LINK - click handler/function that prompts user for
		//name of new folder and sets that as destination folder for add
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		$('#addNewFolder').on('click', newFolderPrompt);

		function newFolderPrompt(e){
			// $('#newFolderNameInput').removeClass('hide-class');
		if($('#addBox').hasClass('open')){

		} else {
			$('#addBox').stop().animate({height:'+=42px'},300,'easeOutQuint', 
				function(){
					$('#addBox').addClass('open');
					$('.nwInputs').removeClass('hide-class');
			});
		}


		}
		var newLinkDest = '';
		function saveNewFolder(e){
			var folder = new Object();
			folder.title = $('#newFolderNameInput').val();

			//creates folder object and adds tabs to it
			//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		    chrome.bookmarks.create(folder, function(data){
		    	console.log(data);
		    	var folderCreated = true;
		    	newLinkDest = data.id;
		    	newFolderBoxRemove(folder.title, folderCreated);
       	
		    });			
		}

		$('#newFolderNameSubmit').on('click', saveNewFolder);
		$('#newFolderNameCancel').on('click', {folderCreated: false}, newFolderBoxRemove);

		function newFolderBoxRemove(title, folderCreated){
			if(folderCreated){
				$('#destFolderName').text(title);
			}
			$('#addBox').stop().animate({height:'-=42px'},300,'easeOutQuint', 
				function(){
					$('.nwInputs').addClass('hide-class');
					$('#addBox').removeClass('open');
			});
		
		}


















		//HERE LIES THE ONLY WAY I COULD FIGURE OUT HOW TO HANDLE ALL EVENTS WITH ONE HANDLER
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//Adds an event listener to the element that contains the bookmark list
		$('#linkBox').on('click', processAction);
		$('#linkBox').on('mouseover', processMouseover)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		//Processes the event when user clicks a bookmark
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function processAction(e){
			console.log(e);
			var tgt = e.target;
			// console.log(e.target.url, e.target.id.substr(0,3), e.target.attributes.data.value);
			if(tgt.attributes.class.value.substr(0,6) == 'delete'){
				removeBookmark(e);		
			} else if(tgt.id.substr(0,3) === 'but'){

				console.log(tgt.attributes.class.value);
				if(tgt.attributes.class.value.includes('submit')){
					updateTitleSubmit(e);
				} else if(tgt.attributes.class.value.includes('addto')){
					pickDestFolder(tgt.id);
				} else {
					openAllFolderMarks(tgt.id.substr(4));
				}
				
			} else if(tgt.attributes.data.value === 'true') {
				getFolderMarks(e);
			} else if(tgt.id === 'cancelRemove'){
				processCancel(e);
			} else if (tgt.id === 'confirmRemove'){
				processRemoval(e);
			} else if (tgt.attributes.data.value === 'update'){
				updateTitle(e);
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
			console.log('clicked remove bookmark', e, e.target);
			if (e.target.id == '') {console.log('its a link');return;}

		    if (e.target !== e.currentTarget) {

				$('.deleteLink').prop('disabled', true);

		        elementId = 'fol-'+e.target.id.substr(4);
				bookmarkId = elementId.substr(4);
				console.log(elementId, bookmarkId);
				//this is a way of stashing the contents of the link item in the DOM
				//while the user decides if they want to delete it
				remContent = $('#'+elementId).children().detach();

				//added the following setTimeouts so that the animation would work
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				setTimeout(function(){
					console.log(elementId); 
					$('#'+elementId).append('<div id="confirmBox"></div>')
		 		}, 100);
		 		setTimeout(function(){ 
		 			console.log(elementId, bookmarkId, e.target.id.substr(4));
		 		 	$('#confirmBox').append('<input id="confirmRemove" class="btn btn-default greenHov" type="button" value="confirm" ng-click="scope.links.splice($index,1)" data="'+elementId+'">')
					$('#confirmBox').append('<input id="cancelRemove" class="btn btn-default redHov" type="button" value="cancel" data="'+elementId+'">');
		 		 }, 200);

		 		if($('#'+elementId).height() > 49){
		 	 		$('#'+elementId).stop().animate({height:'+=48px'},100,'easeOutQuint');
		 	 	}

		    }
		    e.stopPropagation();
		}

		//processes the cancel remove event
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function processCancel(e){
			$('.deleteLink').prop('disabled', false);
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
			$('.deleteLink').prop('disabled', false);
				console.log($('#'+elementId).attr('data'));
				//if the data attribute is true it means its a folder
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				if($('#'+elementId).attr('data')){
					console.log('folder remove');
					var folderId = bookmarkId;
					chrome.bookmarks.getChildren(bookmarkId, function(data){
						data.forEach(function(mark){
							console.log(mark);
							$scope.delete(mark.id);
							chrome.bookmarks.remove(mark.id, function(data){
								console.log('folder removed', data);
							});
						});
						$scope.delete(bookmarkId);
						chrome.bookmarks.remove(bookmarkId, function(data){console.log(data);});
					});

				} else {
					//otherwise its a bookmark
					$scope.delete(bookmarkId);
					chrome.bookmarks.remove(bookmarkId, function(x){
						console.log('bookmark removed', x);
					});		
				}
				//little fancy animation before removing the link item
				var elemH = $('#'+elementId).height();
				$('#'+elementId).animate({height:'-='+elemH+'px'},100,'swing',removeItem(elementId));
		}
		//removes the item from the the DOM
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		function removeItem(id){
			console.log('remove-->',id);
			console.log($('#'+id).children().find('input'));
			setTimeout(function(){ 
				$('#'+id).remove();
				$('#'+id).children().remove();
				$('#'+id).children().find('input').remove();
			 }, 100);
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		var recentMarksOpened = [];
		var lastFolderId;
		//Processes the event when user hovers over sublinks in open folder
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function processMouseover(e){
			if(e.target.id.substr(0,7) == 'sublink'){
				showLinkTitle(e.target.id);
			}
		}

		function showLinkTitle(id){
			var result = $.grep(recentMarksOpened, function(e){
				return e.id == id.substr(8);
			});

			if (result.length == 0) {
				console.log('no results');
			} else if (result.length == 1) {
			  var linkTitle = result[0].title;
			  console.log('one result: ',linkTitle);
			} else {
			  console.log('multiple items found');
			  var linkTitle = result[0].title;
			}

			$('#'+id).text(linkTitle.substr(0,48));

			$('#'+id).on('mouseout', function(e){
				$('#'+id).text(result[0].url.substr(0,50));
			})
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


		//GET BOOKMARKS FOR A FOLDER - (process click on folder event)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function getFolderMarks(e) {
			
			if (e.target.id == '') {console.log('its a link');return;}

		    if (e.target !== e.currentTarget) {
		        var folderId = e.target.id;

				//IF/ELSE to check if folder is open or not
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				if($('#'+folderId).hasClass('open')){
					// console.log($('#'+folderId).height(), 'MORE THAN 50');
					console.log('CLOSE');
					var props = {'height': '50px'};
					// $('#'+folderId).animate(props,1000,'easeOutQuint', removeUrls(folderId));
					removeUrls(folderId);
					$('#'+folderId).removeClass('open');
					recentMarksOpened = [];
				} else {
					console.log('OPEN', folderId, lastFolderId);

					if(folderId !== lastFolderId){
						console.log(folderId, lastFolderId);
						$('#'+lastFolderId).removeClass('open');
						removeUrls(lastFolderId);
					}
					// console.log($('#'+folderId).height(), 'LESS THAN 50');
					chrome.bookmarks.getChildren(String(folderId.substr(4)), function(marks){
						// console.log(marks);
						//FOR ADDING FULL LIST ITEM INSTEAD
						// $('#'+e.target.id).append('<ul id="cool"></ul>');
						marks.forEach(function(mark){
							//ADDS FULL LIST ITEM
							// $('#cool').append('<br><li class="linkItemFolder"><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a></li>');
							//Appends an link element for each bookmark in the selected folder
							//doesn't display folders inside folders
							if(mark.url){
								$('#'+e.target.id).append('<br><a id="sublink-'+mark.id+'" href="'+mark.url+'">'+mark.url.substr(0,50)+'</a>');
							}
							recentMarksOpened.push(mark);
							console.log(recentMarksOpened);
							
						});
						// var height = (marks.length * 15)+58+'px';

						// var props = {'height': height};

						// $('#'+folderId).css({display:'block'}).addClass('open');
						$('#'+folderId).addClass('open');

						// $('li[data=true]').removeClass('open');
						
						// console.log($('#'+folderId));
						// $('#'+folderId).animate(props,1000,'easeOutQuint');
						lastFolderId = folderId;
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
				// recentMarksOpened = [];
			}, 100);
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


		//UPDATE TITLE - (processes click on items title span)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function updateTitle(e){
			console.log(e.target.id);
			if(e.target.parentElement.attributes.class.value.includes('open')){
				console.log('folder must be closed!');
			} else {
				console.log('updating',e.target.id);
				console.log('target is:',e.target.parentElement.attributes.data.value == true ? 'a folder' : 'not a folder');
				var itemId = e.target.id.substr(4);
				console.log(itemId);
				var inputId = 'inp-'+itemId;
				$('#'+e.target.id).addClass('hide-class');
				$('#'+inputId).removeClass('hide-class');

				if(e.target.parentElement.attributes.data.value === 'false'){
					console.log('append?', e.target.parentElement.attributes.id);

					$('#'+e.target.parentElement.attributes.id.value).append('<input id="but-'+itemId+'" type="button" class="btn btn-primary submit update-submit" value="submit">');
					// <input ng-if="!link.url && !folderMod.value" id="but-{{link.id}}" class="btn btn-primary openAllBtn" type="button" value="open all">
				} else {
					console.log(' no append..');
					$('#but-'+itemId).val('submit');
					$('#but-'+itemId).addClass('submit');
				}

				setTimeout(function(){ $('#'+inputId).focus();$('#'+inputId).select(); }, 1000);
				// $('#'+e.target.id).append('<input type="text" value="'+e.target.id+'">');	
			}

		}

		function updateInputRemove(id, data, is_folder){
			console.log(id, data, is_folder);
			$('.titleInput').addClass('hide-class');
			$('.linkTitle').removeClass('hide-class');
			if(is_folder === 'true'){
				console.log('FOLDER teardown');
				$('.submit').val('open all');
				$('.submit').removeClass('submit');			
			} else {
				console.log('LINK teardown');
				$('#but-'+id).remove();
			}
			console.log(data.title, $('#tit-'+id));
			$('#tit-'+id).text(data.title);

		}

		function updateTitleSubmit(e){
			console.log(e);
			var id = e.target.id.substr(4);
			var is_folder = e.target.parentElement.attributes.data.value;
			console.log(id, is_folder);
    		var bookmark = new Object();
    		bookmark.title = $('#inp-'+id).val();

    		console.log(bookmark);
    		chrome.bookmarks.update(String(id), bookmark, function(data){
    			console.log('data->',data);
    			updateInputRemove(id, data, is_folder);

    		});
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	} //END OF BOOKMARKSLOADED INIT FUNCTION
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~























	$scope.delete = function(id){
		console.log('deleting...');
		// console.log(id, $scope.links);
		function hasId(element) {
			// console.log(element.id);
		  	if(element.id == id){
		  		console.log(element.id);
		  		return element.id;
		  	}
		}
		$scope.links.splice($scope.links.findIndex(hasId, id), 1);
		$scope.$apply();
		// console.log($scope.links);
	}

	//filter function that watches checkbox & filters by folder when checked
	$scope.checkboxModel = { value: false };
	$scope.filterFunc = function(items, query){
		// console.log(items, query);
		if($scope.checkboxModel.value === true){
			return !items.url;
		} else {
			return items;
		}
	}


//load times 13 12 15 12 20 12
	var folders = [];
	var marks = [];
	var timeS = 0;
	$scope.getChildren = function(id){

		chrome.bookmarks.getChildren(String(id), function(data){
			// console.log('4th', data);
			data.forEach(function(node){
				if(node.hasOwnProperty('url')){
					marks.push(node);
					// console.log('4', marks);
				} else {
					marks.push(node);
					folders.push(node);
					// GO GET MORE CHILDREN FOR THIS NODE
					$scope.getChildren(node.id);
					// console.log('FUCKKK');
				}	
			});
		});

	}


	$scope.fetchBookMarks = function(){
		timeS = new Date().getTime();
		// console.log(timeS);
		$scope.waiting = true;
		var x = 1;
		while(x < 4){
			var y;
			y = String(x);
			$scope.getChildren(y);
			x++;
		}
		console.log('all-marks: ', marks, folders);
		$scope.waiting = false;
		$scope.links = marks;
		$scope.folders = folders;
		var timeE = new Date().getTime() - timeS;
		console.log(timeE);
		$scope.bookmarksLoaded($scope, timeE);
		// $scope.populateAutocomplete();
	}
	$scope.fetchBookMarks();




//THINGS TO DO
//



	
});