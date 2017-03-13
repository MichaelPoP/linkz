'use strict';
//NEED TO GET RID OF SET_TIMEOUT, NEED TO SPLIT INTO MORE FUCNTIONS
//NEED TO TURN MORE PARTS INTO DIRECTIVES/COMPONENTS (sometimes directives suck)
var linkzApp = angular.module('linkzApp', ['ngRoute']);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
linkzApp.controller('listCon', function listCon($scope) {
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
			//when folder is in dropzone occupied is true, links and folders can be dropped
			//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			if(occupied === true){
				$('#folderDrop').droppable({
					//for accepting only bookmarks
					accept: 'li[data*=false], li[data*=true]',
					tolerance: 'touch',
			      	drop: function(event, ui) {
			      		var folderId = id;
			      		// checks if dropped item is link or folder 
						if(ui.draggable[0].attributes.data.value === 'false'){
							// if its a link then go ahead and move it
							var props1 = {color:'hex(#1BDC35)',borderColor:'hex(#1BDC35)'};
							//here the dropped link is actually moved to folder
							chrome.bookmarks.move(String(ui.draggable[0].attributes.id.value.substr(4)), {'parentId': String(folderId)}, function(data){});
							$('#folderDrop').children().addClass('hide-class');
							$('#folderDrop')
								.addClass('moving-state')
								.append('<p id="droppedMark">'+ui.draggable[0].innerText+'</p>')
								.animate(props1,1000,'easeOutQuint');
								setTimeout(function(){ 
									var props2 = {color:'hex(#000)', borderColor:'hex(#05B6FF)'};
									var remProps = {'opacity': 0};
									$('#droppedMark').remove().animate(remProps, 1000, 'easeOutQuint');
									$('#folderDrop').children().removeClass('hide-class');
									$('#folderDrop').removeClass('moving-state').addClass('occupied-state');
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
			      		var props = {'height': '44px', 'width':'432px',backgroundColor:'hex(#FFF)',color:'hex(#000)',borderColor:'hex(#05B6FF)'};
			        	$(this)
			        		.addClass('occupied-state')
			        		.removeClass('dropBox')
			            	.html('<p class="folderTitle">drag links to add to folder: '+ui.draggable[0].title+'</p>')
			            	.animate(props,1000,'easeOutQuint');
			            occupied = true;
			            initDropzone(ui.draggable[0].attributes.id.value.substr(4));
			      	} 	
			    });	
			}
		};
		initDropzone();
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function disableAddButtons(){
			toggleAddbuttonStyle();
    		$('#addLink').prop('disabled', true);
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
			} else { addLink.removeClass('nope').addClass('raised'); }
			var addAll = $('#addAll');
			if(addAll.hasClass('raised')){
			 	addAll.removeClass('raised').addClass('nope');
			} else { addAll.removeClass('nope').addClass('raised'); }
		}

		//remove the success alert for adding links and folders
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function removeAlert(){
			$('#alertBox').addClass('hide-class');
			$('#alertBox').children().remove();
			$('#alertBox').css('height', '26px');
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//ADD BOOKMARK - click handler/function for adding current tab to bookmarks
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('#addLink').on('click', function(e){
			disableAddButtons();
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			    var url = tabs[0].url;
			    var title = tabs[0].title;
			    $('#linkNameInput').val(title);
			    $scope.currUrl = url;
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
			$('#addBox').stop().animate({height:'+=67px'},300,'easeOutQuint', function(){$('#addFormBox').removeClass('hide-class');});
		});

		function folderMod(){
			var onlyFolders = $scope.folders;
			onlyFolders.forEach(function(f){
				$('#but-'+f.id).val('add');
				$('#but-'+f.id).addClass('addto');
			});			
		}

		var linkDest = '';
		function pickDestFolder(id){
			linkDest = id.substr(4);
			var desTitle = $('#tit-'+linkDest).text();
			$('#destFolderName').text(desTitle);
		}

		function onSuccess(desTitle, newLinkData){
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
	    	var newLinkData = data;
	    	$('#destFolderName').text('');
			$('#linkNameInput, #linkNameSubmit, #linkDestInput').addClass('hide-class');
			$('#addBox').animate({height:'-=67px'},500,'easeOutQuint');
			$('#addBox').addClass('hide-class');
			$('#addFormBox').addClass('hide-class');

			var onlyFolders = $scope.folders
			onlyFolders.forEach(function(f){
				$('#but-'+f.id).val('open all');
				$('#but-'+f.id).removeClass('addto');
			});
			$scope.folderMod = { value: false };

			if(!linkCreated){ enableAddButtons(); }

			if(linkCreated){
				$('#alertBox').addClass('alert-suxess');
				$('#alertBox').removeClass('hide-class');
				$('#alertBox').stop().animate({height:'+=50px'},500,'easeOutQuint');
				enableAddButtons();					

		    	chrome.bookmarks.get(data.parentId, function(data){
		    		var desTitle = data[0].title;
		    		onSuccess(desTitle, newLinkData);
		    	});
			}
		}


		function saveLink(e){
			var linkName = $('#linkNameInput').val();
			var scopeDest = linkDest;
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			    var bookmark = new Object();
			    bookmark.parentId = newLinkDest || linkDest || '1';
			    bookmark.title = linkName || tabs[0].title;
			    bookmark.url = tabs[0].url;

			    chrome.bookmarks.create(bookmark, function(data){
			    	var linkCreated = true;
			    	addBoxRemove(data, linkCreated);
			    });
			});
		}

		$('#linkNameSubmit').on('click', saveLink);
		$('#linkNameCancel').on('click', {linkCreated: false}, addBoxRemove);


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
				var folder = new Object();
				folder.title = folderName;
				var height = (tabs.length * 20)+48+'px';
				var props = {'height':height};

				//creates folder object and adds tabs to it
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			    chrome.bookmarks.create(folder, function(data){
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
			    });

			    //loops through tabs and creates bookmarks in the given folder
			    //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			    function addTabs(folderId){
			    	var folderId = folderId;
			    	tabs.forEach(function(tab){
			    		var bookmark = new Object();
			    		bookmark.parentId = folderId;
			    		bookmark.title = tab.title;
			    		bookmark.url = tab.url;
			    		chrome.bookmarks.create(bookmark, function(data){
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
		    	var folderCreated = true;
		    	newLinkDest = data.id;
		    	newFolderBoxRemove(folder.title, folderCreated);	
		    });			
		}

		$('#newFolderNameSubmit').on('click', saveNewFolder);
		$('#newFolderNameCancel').on('click', {folderCreated: false}, newFolderBoxRemove);

		function newFolderBoxRemove(title, folderCreated){
			if(folderCreated){ $('#destFolderName').text(title); }
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
			var tgt = e.target;
			// console.log(e.target.url, e.target.id.substr(0,3), e.target.attributes.data.value);
			if(tgt.attributes.class.value.substr(0,6) == 'delete'){
				removeBookmark(e);		
			} else if(tgt.id.substr(0,3) === 'but'){
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
			if (e.target.id == '') {return;}
		    if (e.target !== e.currentTarget) {
				$('.deleteLink').prop('disabled', true);
		        elementId = 'fol-'+e.target.id.substr(4);
				bookmarkId = elementId.substr(4);
				//this is a way of stashing the contents of the link item in the DOM
				//while the user decides if they want to delete it
				remContent = $('#'+elementId).children().detach();
				//added the following setTimeouts so that the animation would work
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				setTimeout(function(){ 
					$('#'+elementId).append('<div id="confirmBox"></div>');
		 		}, 100);
		 		setTimeout(function(){ 
		 		 	$('#confirmBox').append('<input id="confirmRemove" class="btn btn-default greenHov" type="button" value="confirm" ng-click="scope.links.splice($index,1)" data="'+elementId+'">');
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
			$('#confirmBox').remove();
			$('#confirmRemove').remove();
			$('#cancelRemove').remove();
			remContent.appendTo('#'+elementId);
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//DELETE A BOOKMARK - process click on confirm event 
		//(actually deletes the bookmark)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function processRemoval(e){
			$('.deleteLink').prop('disabled', false);
				//if the data attribute is true it means its a folder
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				if($('#'+elementId).attr('data')){
					var folderId = bookmarkId;
					chrome.bookmarks.getChildren(bookmarkId, function(data){
						data.forEach(function(mark){
							$scope.delete(mark.id);
							chrome.bookmarks.remove(mark.id, function(data){});
						});
						$scope.delete(bookmarkId);
						chrome.bookmarks.remove(bookmarkId, function(data){console.log(data);});
					});
				} else {
					//otherwise its a bookmark
					$scope.delete(bookmarkId);
					chrome.bookmarks.remove(bookmarkId, function(x){});		
				}
				//little fancy animation before removing the link item
				var elemH = $('#'+elementId).height();
				$('#'+elementId).animate({height:'-='+elemH+'px'},100,'swing',removeItem(elementId));
		}
		//removes the item from the the DOM
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		function removeItem(id){
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
			} else if (result.length == 1) {
			  var linkTitle = result[0].title;
			} else {
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
			if (e.target.id == '') {return;}
		    if (e.target !== e.currentTarget) {
		        var folderId = e.target.id;

				//IF/ELSE to check if folder is open or not
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				if($('#'+folderId).hasClass('open')){
					var props = {'height': '50px'};
					removeUrls(folderId);
					$('#'+folderId).removeClass('open');
					recentMarksOpened = [];
				} else {
					if(folderId !== lastFolderId){
						$('#'+lastFolderId).removeClass('open');
						removeUrls(lastFolderId);
					}
					chrome.bookmarks.getChildren(String(folderId.substr(4)), function(marks){
						//FOR ADDING FULL LIST ITEM INSTEAD
						marks.forEach(function(mark){
							//Appends an link element for each bookmark in the selected folder
							//doesn't display folders inside folders
							if(mark.url){
								$('#'+e.target.id).append('<br><a id="sublink-'+mark.id+'" href="'+mark.url+'">'+mark.url.substr(0,50)+'</a>');
							}
							recentMarksOpened.push(mark);			
						});
						$('#'+folderId).addClass('open');
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
			}, 100);
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//OPEN ALL BOOKMARKS FOR FOLDER - (processes click on open all button)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function openAllFolderMarks(id){
			chrome.bookmarks.getChildren(String(id), function(marks){
				marks.forEach(function(mark){
					chrome.tabs.create({url: mark.url});
				});
			});
		}

		//UPDATE TITLE - (processes click on items title span)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function updateTitle(e){
			if(e.target.parentElement.attributes.class.value.includes('open')){
			} else {
				var itemId = e.target.id.substr(4);
				var inputId = 'inp-'+itemId;
				$('#'+e.target.id).addClass('hide-class');
				$('#'+inputId).removeClass('hide-class');
				if(e.target.parentElement.attributes.data.value === 'false'){
					$('#'+e.target.parentElement.attributes.id.value).append('<input id="but-'+itemId+'" type="button" class="btn btn-primary submit update-submit" value="submit">');
				} else {
					$('#but-'+itemId).val('submit');
					$('#but-'+itemId).addClass('submit');
				}
				setTimeout(function(){ $('#'+inputId).focus();$('#'+inputId).select(); }, 1000);
			}

		}
		function updateInputRemove(id, data, is_folder){
			$('.titleInput').addClass('hide-class');
			$('.linkTitle').removeClass('hide-class');
			if(is_folder === 'true'){
				$('.submit').val('open all');
				$('.submit').removeClass('submit');			
			} else {
				$('#but-'+id).remove();
			}
			$('#tit-'+id).text(data.title);
		}
		function updateTitleSubmit(e){
			var id = e.target.id.substr(4);
			var is_folder = e.target.parentElement.attributes.data.value;
    		var bookmark = new Object();
    		bookmark.title = $('#inp-'+id).val();
    		chrome.bookmarks.update(String(id), bookmark, function(data){
    			updateInputRemove(id, data, is_folder);
    		});
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	} //END OF BOOKMARKSLOADED INIT FUNCTION
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	$scope.delete = function(id){
		function hasId(element) {
		  	if(element.id == id){
		  		return element.id;
		  	}
		}
		$scope.links.splice($scope.links.findIndex(hasId, id), 1);
		$scope.$apply();
	}
	//filter function that watches checkbox & filters by folder when checked
	$scope.checkboxModel = { value: false };
	$scope.filterFunc = function(items, query){
		if($scope.checkboxModel.value === true){
			return !items.url;
		} else {
			return items;
		}
	}
	var folders = [];
	var marks = [];
	var timeS = 0;
	$scope.getChildren = function(id){
		chrome.bookmarks.getChildren(String(id), function(data){
			data.forEach(function(node){
				if(node.hasOwnProperty('url')){
					marks.push(node);
				} else {
					marks.push(node);
					folders.push(node);
					// GO GET MORE CHILDREN FOR THIS NODE
					$scope.getChildren(node.id);
				}	
			});
		});
	}
	$scope.fetchBookMarks = function(){
		timeS = new Date().getTime();
		$scope.waiting = true;
		var x = 1;
		while(x < 4){
			var y;
			y = String(x);
			$scope.getChildren(y);
			x++;
		}
		$scope.waiting = false;
		$scope.links = marks;
		$scope.folders = folders;
		var timeE = new Date().getTime() - timeS;
		$scope.bookmarksLoaded($scope, timeE);
	}
	$scope.fetchBookMarks();
	
});