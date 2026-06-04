angular.module('studentApp').directive('studentCard', function() {
  return {
    restrict: 'E',
    scope: {
      student : '=',
      onRemove: '&'
    },
    template:
      '<div class="card">' +
        '<h3>{{ student.name }}</h3>' +
        '<p>{{ student.roll }} | {{ student.course }}</p>' +
        '<p>GPA: {{ student.gpa }}</p>' +
        '<a ng-href="#!/students/{{ student.id }}">View</a>' +
        '<button ng-click="onRemove()">Remove</button>' +
      '</div>'
  };
});
