// Home
angular.module('studentApp').controller('HomeCtrl', function($scope, StudentService) {
  $scope.count  = StudentService.getAll().length;
  $scope.avgGPA = StudentService.getAvgGPA();
});

// List
angular.module('studentApp').controller('ListCtrl', function($scope, StudentService) {
  $scope.students   = StudentService.getAll();
  $scope.searchText = '';
  $scope.remove     = function(id) { StudentService.remove(id); };
});

// Add
angular.module('studentApp').controller('AddCtrl', function($scope, $location, StudentService) {
  $scope.student = { course: 'MCA' };
  $scope.save = function() {
    if ($scope.addForm.$valid) {
      StudentService.add($scope.student);
      $location.path('/students');
    }
  };
});

// Detail
angular.module('studentApp').controller('DetailCtrl', function($scope, $routeParams, StudentService) {
  $scope.student = StudentService.getById($routeParams.id);
});
