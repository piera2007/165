// models/Student.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  strasse: String,
  stadt: String,
  plz: String
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  geburtsdatum: Date,
  adresse: addressSchema, // Eingebettetes Dokument
  klassen: [String], // Array von Klassenbezeichnungen
  noten: [{
    fach: String,
    note: Number,
    datum: Date
  }]
});

module.exports = mongoose.model('Student', studentSchema);
