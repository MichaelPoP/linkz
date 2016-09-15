'use strict';

var linkzApp = angular.module('linkzApp', []);


linkzApp.controller('listCon', function listCon($scope) {
$scope.fetchBookMarks = function(){
	$scope.waiting = true;
	var x = 1;
	var bms = [];
	while(x < 4){
		var y;
		// console.log(x);
		y = String(x);
		chrome.bookmarks.getChildren(y, function(data){
			// console.log('1st', data);
			data.forEach(function(node){
				if(node.hasOwnProperty('url')){
					bms.push(node);
					// console.log('1', bms);
				} else {
					chrome.bookmarks.getChildren(String(node.id), function(data){
						// console.log('2nd', data);
						data.forEach(function(node){
							if(node.hasOwnProperty('url')){
								bms.push(node);
								// console.log('2', bms);
							} else {
								chrome.bookmarks.getChildren(String(node.id), function(data){
									// console.log('3rd', data);
									data.forEach(function(node){
										if(node.hasOwnProperty('url')){
											bms.push(node);
											// console.log('3', bms);
										} else {
											chrome.bookmarks.getChildren(String(node.id), function(data){
												// console.log('4th', data);
												data.forEach(function(node){
													if(node.hasOwnProperty('url')){
														bms.push(node);
														// console.log('4', bms);
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
	console.log('final', bms);
	$scope.waiting = false;
	$scope.links = bms;
	bookmarksLoaded();
}
$scope.fetchBookMarks();









	
});