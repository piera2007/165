// scripts/importStudents.js
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const results = [];

mongoose.connect('mongodb+srv://dbAdmin:cSReR6ozlS35gEXN@cluster0.8faof.mongodb.net/schuelerdb?retryWrites=true&w=majority');

fs.createReadStream('students.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    try {
      for (let studentData of results) {
        // Bei Bedarf: Konvertierung von Feldern, z.B. JSON-Parsing für Noten
        if (studentData.noten) {
          try {
            studentData.noten = JSON.parse(studentData.noten);
          } catch (e) {
            studentData.noten = [];
          }
        }
        const student = new Student(studentData);
        await student.save();
      }
      console.log('Datenimport abgeschlossen!');
      process.exit(0);
    } catch (error) {
      console.error('Importfehler:', error);
      process.exit(1);
    }
  });
