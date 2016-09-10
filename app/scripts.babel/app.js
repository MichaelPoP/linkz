'use strict';

var linkzApp = angular.module('linkzApp', []);

linkzApp.controller('listCon', function listCon($scope) {
	var x = 1;
	var bms = [];
	while(x < 4){
		var y;
		console.log(x);
		y = String(x);
		chrome.bookmarks.getChildren(y, function(data){
			console.log('1st', data);
			data.forEach(function(node){
				if(node.hasOwnProperty('url')){
					bms.push(node);
					console.log('1', bms);
				} else {
					chrome.bookmarks.getChildren(String(node.id), function(data){
						console.log('2nd', data);
						data.forEach(function(node){
							if(node.hasOwnProperty('url')){
								bms.push(node);
								console.log('2', bms);
							} else {
								chrome.bookmarks.getChildren(String(node.id), function(data){
									console.log('3rd', data);
									data.forEach(function(node){
										if(node.hasOwnProperty('url')){
											bms.push(node);
											console.log('3', bms);
										} else {
											chrome.bookmarks.getChildren(String(node.id), function(data){
												console.log('4th', data);
												data.forEach(function(node){
													if(node.hasOwnProperty('url')){
														bms.push(node);
														console.log('4', bms);
													} else {
														console.log('FUCKKK');
													}
													
												})
											});
										}
										
									})
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
	$scope.links = bms;


	// chrome.bookmarks.getTree(function (data) {
	// 	var bms = [];
	// 	console.log(data);
	// 	var tree = data[0];
	// 	// console.log(tree);


	// 		// console.log(tree[i]);
	// 		// tree[i].forEach(function (y) {
	// 		// 	if (x.hasOwnProperty('children')) {
	// 		// 		console.log('has children');
	// 		// 	} else {
	// 		// 		console.log(x);
	// 		// 		bms.push(x);
	// 		// 	}
	// 		// });
		
	// 	// x.forEach(function(y){
	// 	// 	if(x.hasOwnProperty('children')){
	// 	// 		console.log('has children');

	// 	// 	} else {
	// 	// 		bms.push(x);
	// 	// 	}
	// 	// });
	// 	// });
	// 	console.log(bms);

	// 	$scope.links = tree;
	// });
});