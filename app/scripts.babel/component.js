angular.module('linkzApp.component', [])
// .component('linkList', {
//   templateUrl: 'linkList.html',
//   controller: listCon,
//   bindings: {
//     links: '='
//   }
// });
.component('linkList', {
  templateUrl: 'linkList.html',
  controller: listCon,
  bindings: {
    links: '='
  }
});