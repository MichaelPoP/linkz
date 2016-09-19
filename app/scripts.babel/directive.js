angular.module('linkzApp.directive', [])
.directive('jqSlider', [function() {
  return {
    restrict: 'A',
    scope: {
      'model': '='
    },
    link: function(scope, elem, attrs) {
    	console.log(scope, scope.strArray);
      $(elem).autocomplete({
				source: scope.strArray
			});
    }
  };
}]);




// angular.module('linkzApp.directive', [])
// .directive('autoComplete', function () {
//     return {
//     	restrict: 'A',
//     	link: function(scope, elem){
//     		// console.log($scope.strArray);
// 			$('#queryInput').autocomplete({
// 				source: 'dd'
// 			});
//     	}
//     }
// });

