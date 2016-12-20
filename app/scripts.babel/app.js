'use strict';
//NEED TO GET RID OF SET_TIMEOUT, NEED TO SPLIT INTO MORE FUCNTIONS
//NEED TO TURN MORE PARTS INTO DIRECTIVES/COMPONENTS (sometimes directives suck)
var linkzApp = angular.module('linkzApp', ['ngRoute', 'linkzApp.directive', 'linkzApp.service']);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
linkzApp.controller('listCon', function listCon($scope) {

$('#container').imagesLoaded().fail( function( instance ) {
  console.log('FAIL ', instance);
});

	var allAboard = false;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_//
//function called when all the bookmarks have been fetched to prevent all sorts
//of errors, but ideally this would be in a component fetching from a service
	$scope.bookmarksLoaded = function($scope) {
		console.log('bookmarks loaded...');
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

		//handles links that have broken or non-existent favicons
  		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// function handleError(){
		// 	console.log('handled?');
		// 	$(this).attr('src', '../images/missing.png');
		// 	// '../images/missing.png'; ???
		// }
		// $(document).ready(function () {
		//     $('img').on('error', handleError);
		// });
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//JQuery UI code for making bookmarks SORTABLE/DRAGGABLE
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('#linkList').sortable();
		//JQuery UI initializes ACCORDION on folders
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// function initAccordion(){ 
		// 	console.log($scope.folders, typeof $scope.folders);
		// 	var onlyFolders = $scope.folders;
		// 	console.log(onlyFolders);
		// 	onlyFolders.forEach(function(f){
		// 		console.log(f);
		// 		$('#fol-'+f.id).accordion({
		// 		 	animate: 'easeOutQuint',
		// 		 	collapsible: true,
		// 		 	heightStyle: 'content'
		// 		});
		// 	});

		// }
		// initAccordion();

		//set occupied to false initially so that only folders can be dropped
		var occupied = false;
		var contents;

		//initiates the dropzone and switches mode depending on what is dropped
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//note: still need to write behavior for switching the occupying folder
		function initDropzone(id){
			console.log(occupied, id);
			//when dropzone is occupied it is set to true & only accepts links
			//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
			if(occupied === true){
				$('#folderDrop').droppable({
					//for accepting only bookmarks
					accept: 'li[data*=false]',
					// accept: 'li',
					tolerance: 'touch',
			      	drop: function(event, ui) {
			      		console.log(event, ui);
			      		console.log(ui.draggable[0].innerText);
			      		// var props = {'background': '#7EF1ED'};
			      		var props1 = {color:'hex(#1BDC35)',borderColor:'hex(#1BDC35)'};
			      		//here the dropped link is actually moved to folder
			      		chrome.bookmarks.move(String(ui.draggable[0].attributes.id.value.substr(4)), {'parentId': String(id)}, function(data){
			      			console.log('moved', data);
			      		});

			      		$('#folderDrop').children().addClass('hide-class');

			        	$('#folderDrop')
			        		.addClass('dropped-state')
			          		// .find('span')
			            	.append('<p id="droppedMark">'+ui.draggable[0].innerText+'</p>')
			            	.animate(props1,1000,'easeOutQuint');
			            	setTimeout(function(){ 
			            		// var props = {'background': '#93DDF1'};
			            		var props2 = {color:'hex(#000)', borderColor:'hex(#05B6FF)'};
			            		var remProps = {'opacity': 0};
			            		$('#droppedMark').remove().animate(remProps, 1000, 'easeOutQuint');
			            		$('#folderDrop').children().removeClass('hide-class');
			            		$('#folderDrop').removeClass('dropped-state').addClass('occupied-state');
			            		// console.log($contents);
			            		// contents.appendTo('#folderDrop');
			            		$('#folderDrop').animate(props2, 1000, 'easeOutQuint');
			            	}, 2500);
			            initDropzone();
			      	}
			    });
			} else {
				//condition initializes the dropzone for link dropping
				//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
				$('#folderDrop').droppable({
					accept: 'li[data*=true]',
					tolerance: 'touch',
			      	drop: function(event, ui) {
			      		console.log(event, ui);
			      		console.log(ui.draggable[0].innerText);
			      		var props = {'height': '60px', 'width':'290px',backgroundColor:'hex(#FFF)',color:'hex(#000)',borderColor:'hex(#05B6FF)'};
			        	$(this)
			        		.addClass('occupied-state')
			          		// .find('span')
			            	.html('<p class="folderTitle">'+ui.draggable[0].innerText+'</p>')
			            	.append('<p>drag a bookmark here to add it the folder</p>')
			            	.animate(props,1000,'easeOutQuint');
			            occupied = true;
			            initDropzone(ui.draggable[0].attributes.id.value.substr(4));
			      	} 	
			    });	

			}

		};
		initDropzone();
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//remove the success alert for adding links and folders
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function removeAlert(){
			// console.log($('#alertBox'), $('#alertBox').children());
			$('#alertBox').addClass('hide-class');
			$('#alertBox').children().remove();
			$('#alertBox').css('height', '26px');
		}
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//ADD BOOKMARK - click handler/function for adding current tab to bookmarks
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('#addLink').on('click', function(e){
			// $scope.linkDest 
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				console.log(tabs);
			    var url = tabs[0].url;
			    var title = tabs[0].title;
			    console.log(url, title);

			    $('#linkNameInput').val(title);
			    $scope.currUrl = url;
			    console.log(url, $scope.currUrl, title, $scope.currTitle);

			    // chrome.bookmarks.create(bookmark, function(data){
			    // 	console.log(data);
			    // });
			});
			//filter the results by folder
			$('#folderCheckbox').prop('checked', true);
			$scope.checkboxModel = { value: true };
			$scope.$apply()
			// $('#folderCheckbox').removeClass('ng-pristine ng-untouched ng-empty');
			// $('#folderCheckbox').addClass('ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched');

			var onlyFolders = $scope.folders;
			console.log(onlyFolders);
			onlyFolders.forEach(function(f){
				console.log(f);
				$('#but-'+f.id).val('add');
				$('#but-'+f.id).addClass('addto');
				// $('#fol-'+f.id).append()
			});

			$('#linkNameInput, #linkNameSubmit, #linkDestInput').removeClass('hide-class');
			$('#linkNameInput').focus();
			$('#addBox').removeClass('hide-class');
			// $('#addFormBox').removeClass('hide-class');
			$('#addBox').stop().animate({height:'+=67px'},300,'easeOutQuint', function(){$('#addFormBox').removeClass('hide-class');});
			// $('#addBox').stop().animate({height:'+=67px'},600,'easeOutQuint');
		});

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

		$('#linkNameSubmit').on('click', function(){
			var linkName = $('#linkNameInput').val();
			// var linkDest = $('#linkDestInput').val();
			console.log(linkName, linkDest);
			chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				console.log(tabs);

			    var bookmark = new Object();
			    bookmark.parentId = linkDest
			    bookmark.title = linkName || tabs[0].title;
			    bookmark.url = tabs[0].url;
			    console.log(bookmark, bookmark.parentId, bookmark.title, bookmark.url);

			    chrome.bookmarks.create(bookmark, function(data){
			    	console.log(data);
			    	$('#destFolderName').text('');
			    	console.log(new Date(data.dateAdded));
					$('#linkNameInput, #linkNameSubmit, #linkDestInput').addClass('hide-class');
					$('#addBox').animate({height:'-=40px'},500,'easeOutQuint');
					$('#addBox').addClass('hide-class');
					$('#addFormBox').addClass('hide-class');
					$('#alertBox').addClass('alert-suxess');
					$('#alertBox').removeClass('hide-class');
					$('#alertBox').stop().animate({height:'+=50px'},500,'easeOutQuint');

					var onlyFolders = $scope.folders
					onlyFolders.forEach(function(f){
						console.log(f);
						$('#but-'+f.id).val('open all');
						$('#but-'+f.id).removeClass('addto');

						// $('#fol-'+f.id).append()
					});					

					function onSuccess(title){
						console.log('TITLE: '+title, data);
						// $('#linkDestInput option:selected').text()
				    	$('#alertBox').append('<p class="success1Link title">'+data.title.substr(0,60)+'</p><p class="success1Link urlAdded">'+data.url.substr(0,58)+'</p><p class="success1Link destAdded">Added to: '+title+'</p>');
				    	setTimeout(function(){ removeAlert(); }, 2400);			
					}

			    	// var destTitle = '';
			    	chrome.bookmarks.get(linkDest, function(data){
			    		console.log(data[0].title);
			    		var destTitle = data[0].title;
			    		onSuccess(destTitle);
			    	});


			    });
			});	
		});
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//ADD ALL LINKS - click handler/function that prompts user for name and
		//makes all current tabs a bookmark in that directory
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		var showPrompt = false;
		//processes clicking the add all button and displays the name input form
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		$('#addAll').on('click', function(){
			// var folderName = prompt('Name the folder.');
			$('#folderNameInput').removeClass('hide-class').focus();
			$('#folderNameSubmit').removeClass('hide-class');
			$('#folderBox').removeClass('hide-class');
			$('#folderBox').stop().animate({height:'+=48px'},1000,'easeOutQuint');
		});

		//after choosing folder name user clicks submit function
		//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
		$('#folderNameSubmit').on('click', function(){
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
 
			    		$('#folderBox').animate({height:'-=48px'},1000,'easeOutQuint');
			    		$('#folderBox').addClass('hide-class');
			    		
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
			    	setTimeout(function(){ removeAlert(); }, 2400);
			    }

			});

		});//ON CLICK CALLBACK END

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
				console.log(e.target.attributes.class.value);
				if(e.target.attributes.class.value.includes('submit')){
					updateTitleSubmit(e);
				} else if(e.target.attributes.class.value.includes('addto')){
					pickDestFolder(e.target.id);
				} else {
					openAllFolderMarks(e.target.id.substr(4));
				}
				
			} else if(e.target.attributes.data.value === 'true') {
				getFolderMarks(e);
			} else if(e.target.id === 'cancelRemove'){
				processCancel(e);
			} else if (e.target.id === 'confirmRemove'){
				processRemoval(e);
			} else if (e.target.attributes.data.value === 'update'){
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
		 		 	$('#confirmBox').append('<input id="confirmRemove" class="btn btn-default greenHov" style="color:green;" type="button" value="confirm" ng-click="scope.links.splice($index,1)" data="'+elementId+'">')
					$('#confirmBox').append('<input id="cancelRemove" class="btn btn-default" style="color:red;" type="button" value="cancel" data="'+elementId+'">');
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
					removeUrls(folderId)
					$('#'+folderId).removeClass('open');
				} else {
					console.log('OPEN');
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
								$('#'+e.target.id).append('<br><a href="'+mark.url+'">'+mark.url.substr(0,50)+'</a>');
							}
							
						});
						// var height = (marks.length * 15)+58+'px';

						// var props = {'height': height};

						// $('#'+folderId).css({display:'block'}).addClass('open');
						$('#'+folderId).addClass('open');
						// console.log($('#'+folderId));
						// $('#'+folderId).animate(props,1000,'easeOutQuint');

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
				// console.log(marks);
				marks.forEach(function(mark){
					console.log(mark.url);
					chrome.tabs.create({url: mark.url});
				});
			});
		}

		function updateTitleSubmit(e){
			var id = e.target.id.substr(4);
    		var bookmark = new Object();
    		bookmark.title = $('#inp-'+id).val();

    		console.log(bookmark);
    		chrome.bookmarks.update(String(id), bookmark, function(data){
    			console.log('data->',data);

    		});
		}


		//UPDATE TITLE - (processes click on items title span)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		function updateTitle(e){
			console.log('updating',e.target.id);
			console.log(e.target);
			var itemId = e.target.id.substr(4);
			console.log(itemId);
			var inputId = 'inp-'+itemId;
			
			$('#'+e.target.id).addClass('hide-class');
			$('#'+inputId).removeClass('hide-class');

			$('#but-'+itemId).val('submit');
			$('#but-'+itemId).addClass('submit');


			setTimeout(function(){ $('#'+inputId).focus();$('#'+inputId).select(); }, 1000);
			// $('#'+e.target.id).append('<input type="text" value="'+e.target.id+'">');

		}



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
		// timeS = new Date().getTime();
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
		// var timeE = new Date().getTime() - timeS;
		// console.log(timeE);
		$scope.bookmarksLoaded($scope);
		// $scope.populateAutocomplete();
	}
	$scope.fetchBookMarks();




//THINGS TO DO
//



	
});