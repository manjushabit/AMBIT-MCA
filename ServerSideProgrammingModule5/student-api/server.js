const express = require('express');
const app     = express();
app.use(express.json());

// In-memory student data
let students = [
  { id: 1, name: 'Apple', gpa: 8.7, course: 'MCA' },
  { id: 2, name: 'Banana', gpa: 9.1, course: 'MCA' },
];
let nextId = 3;

// GET all students
app.get('/students', (req, res) => {
  res.json(students);
});

// GET one student by id
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

// POST add new student
app.post('/students', (req, res) => {
  const { name, gpa, course } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const newStudent = { id: nextId++, name, gpa, course };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// DELETE student
app.delete('/students/:id', (req, res) => {
  students = students.filter(s => s.id != req.params.id);
  res.status(204).send();
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});