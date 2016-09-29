angular.module('linkzApp.service', [])
.factory('autoCompleteService', [function(scope) {
    return {
        getSource: function(scope) {
        	console.log(scope);
        	var strArray = [];
			var linkObj = scope.$parent.links;

			setTimeout(function(){ 
				linkObj.forEach(function(link){
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