angular.module('studentApp').service('StudentService', function() {

  var students = [
    { id:1, name:'Arjun', roll:'4MCA001', gpa:8.7, course:'MCA' },
    { id:2, name:'Priya', roll:'4MCA002', gpa:9.1, course:'MCA' },
  ];
  var nextId = 3;

  this.getAll    = function()   { return students; };
  this.getById   = function(id) { return students.find(function(s){ return s.id == id; }); };
  this.add       = function(s)  { s.id = nextId++; students.push(s); };
  this.remove    = function(id) { var i = students.findIndex(function(s){ return s.id==id; }); students.splice(i,1); };
  this.getAvgGPA = function()   {
    var sum = students.reduce(function(a,s){ return a+s.gpa; }, 0);
    return (sum / students.length).toFixed(1);
  };
});
