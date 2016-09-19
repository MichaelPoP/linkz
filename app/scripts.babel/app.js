'use strict';

var linkzApp = angular.module('linkzApp', ['linkzApp.directive', 'linkzApp.service']);


linkzApp.controller('listCon', function listCon($scope) {

	$scope.getButton = function(id){
		return '<input id="but-'+id+'" type="button" value="open all">';
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

	$scope.populateAutocomplete = function(){

		$scope.strArray = [];
		console.log($scope.links);
		var linkObj = $scope.links;
		setTimeout(function(){ 
			linkObj.forEach(function(link){
				// console.log(link.title);
				$scope.strArray.push(link.title)
			});
		}, 500);
		console.log($scope.strArray);



	}

	$scope.fetchBookMarks = function(){
		$scope.waiting = true;
		var x = 1;
		var marks = [];
		while(x < 4){
			var y;
			// console.log(x);
			y = String(x);
			chrome.bookmarks.getChildren(y, function(data){
				// console.log('1st', data);
				data.forEach(function(node){
					if(node.hasOwnProperty('url')){
						marks.push(node);
						// console.log('1', marks);
					} else {
						marks.push(node);
						chrome.bookmarks.getChildren(String(node.id), function(data){
							// console.log('2nd', data);
							data.forEach(function(node){
								if(node.hasOwnProperty('url')){
									marks.push(node);
									// console.log('2', marks);
								} else {
									marks.push(node);
									chrome.bookmarks.getChildren(String(node.id), function(data){
										// console.log('3rd', data);
										data.forEach(function(node){
											if(node.hasOwnProperty('url')){
												marks.push(node);
												// console.log('3', marks);
											} else {
												marks.push(node);
												chrome.bookmarks.getChildren(String(node.id), function(data){
													// console.log('4th', data);
													data.forEach(function(node){
														if(node.hasOwnProperty('url')){
															marks.push(node);
															// console.log('4', marks);
														} else {
															// console.log('FUCKKK');
														}	
													});
												});
											}
										});
									});
								}
							});
						});
					}
				});
			});
			x++;
		}
		console.log('final', marks);
		$scope.waiting = false;
		$scope.links = marks;

		bookmarksLoaded();
		$scope.populateAutocomplete();
	}
	$scope.fetchBookMarks();


	$scope.autocomplete_options = function(){
		suggest: suggest_state
	}






	
});