'use strict';

var linkzApp = angular.module('linkzApp', []);


linkzApp.controller('listCon', function listCon($scope) {

$scope.getButton = function(id){
	return '<input id="but-'+id+'" type="button" value="open all">';
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
}
$scope.fetchBookMarks();









	
});