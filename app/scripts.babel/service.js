angular.module('linkzApp.service', [])
.factory('fetchBookmarkService', [function(scope) {
    return {
        getBookmarks: function(scope) {
        	console.log(scope);
			var x = 1;
			var getChildren = function(id){

				chrome.bookmarks.getChildren(String(id), function(data){
					// console.log('4th', data);
					data.forEach(function(node){
						if(node.hasOwnProperty('url')){
							marks.push(node);
							// console.log('4', marks);
						} else {
							marks.push(node);
							// GO GET MORE CHILDREN FOR THIS NODE
							getChildren(node.id);
							// console.log('FUCKKK');
						}	
					});
				});

			}
			while(x < 4){
				var y;
				y = String(x);
				getChildren(y);
				x++;
			}

			console.log('all-marks: ', marks);
			scope.links = marks;
            //this is where you'd set up your source... could be an external source, I suppose. 'something.php'
            return marks;
        }
    }
}])
.factory('autoCompleteService', [function(scope) {
    return {
        getSource: function(scope) {
        	var strArray = [];
			var linkObj1 = scope.$parent.links;
			var linkObj2 = scope.links;
			console.log(linkObj1, linkObj2);

			setTimeout(function(){ 
				linkObj1.forEach(function(link){
					// console.log(link.title);
					strArray.push(link.title)
				});
			}, 1);
			console.log(strArray);
            //this is where you'd set up your source... could be an external source, I suppose. 'something.php'
            return strArray;
        }
    }
}]);