angular.module('linkzApp.service', [])
.factory('fetchMarks', [function() {
    return {
        getSource: function() {
        	console.log($scope);
            //this is where you'd set up your source... could be an external source, I suppose. 'something.php'
            return ['apples', 'oranges', 'bananas'];
        }
    }
}]);