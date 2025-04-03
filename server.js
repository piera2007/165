// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());


// Verbindung zu MongoDB (Beispiel mit Atlas, verwende hier deine Zugangsdaten)
mongoose.connect('mongodb+srv://dbAdmin:cSReR6ozlS35gEXN@cluster0.8faof.mongodb.net/schuelerdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Einfaches Rollen-Middleware
function checkRole(requiredRole) {
  return (req, res, next) => {
    
    const userRole = req.headers['x-role'];
    if (!userRole) {
      return res.status(403).json({ error: 'Kein Zugriff: Keine Rolle angegeben' });
    }

    if (typeof requiredRole === 'string') {
      if (userRole === requiredRole) {
        return next();
      }
    } else if (Array.isArray(requiredRole)) {
      if (requiredRole.includes(userRole)) {
        return next();
      }
    }
    return res.status(403).json({ error: 'Zugriff verweigert: Unzureichende Berechtigung' });
  };
}

// CRUD-Endpunkte mit Rollen-Check

// 1. Schüler:in erstellen (z.B. nur APIUser darf erstellen)
app.post('/students', checkRole('APIUser'), async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Alle Schüler:innen abrufen (z.B. jeder mit Rolle APIUser oder dbAdmin darf lesen)
app.get('/students', checkRole(['APIUser', 'dbAdmin']), async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Schüler:in aktualisieren (nur APIUser)
app.put('/students/:id', checkRole('APIUser'), async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Schüler:in löschen (nur dbAdmin darf löschen)
app.delete('/students/:id', checkRole('dbAdmin'), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/students/average/grade', async (req, res) => {
  try {
    const result = await Student.aggregate([
      { $unwind: "$noten" },
      { $group: { _id: "$klassen", avgNote: { $avg: "$noten.note" } } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

Student.collection.createIndex({ name: "text", "noten.fach": "text" });
app.get('/students/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await Student.find({ $text: { $search: q } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
