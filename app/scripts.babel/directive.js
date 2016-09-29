angular.module('linkzApp.directive', [])
.directive('autoComp', function(autoCompleteService) {
  return {
    restrict: 'A',
    scope: {
      'model': '='
    },
    link: function(scope, elem, attrs) {
    	console.log(scope, elem, attrs);
      $(elem).autocomplete({
				source: autoCompleteService.getSource(scope)
			});
    }
  };
})
.directive('frameUp', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      console.log(scope, elem, attrs);
      $(elem).append('<iframe src="'+elem.data.value+'" width="100%"></iframe>');
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

