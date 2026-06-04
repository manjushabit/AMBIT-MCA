var app = angular.module('studentApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/home',         { templateUrl: 'home.html',   controller: 'HomeCtrl'   })
    .when('/students',     { templateUrl: 'list.html',   controller: 'ListCtrl'   })
    .when('/add',          { templateUrl: 'add.html',    controller: 'AddCtrl'    })
    .when('/students/:id', { templateUrl: 'detail.html', controller: 'DetailCtrl' })
    .otherwise({ redirectTo: '/home' });
});

app.controller('NavCtrl', function($scope, $location) {
  $scope.is = function(path) { return $location.path() === path; };
});
