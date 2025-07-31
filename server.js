const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'client/build')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testimonial-survey', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Survey Schema
const surveySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  question1: { type: String, required: true },
  question2: { type: String, required: true },
  question3: { type: [String], required: true },
  question4: { type: String, required: true },
  question5: { type: String, required: true },
  photoUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

const Survey = mongoose.model('Survey', surveySchema);

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Routes
app.post('/api/survey', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const surveyData = {
      name: req.body.name,
      email: req.body.email,
      question1: req.body.question1,
      question2: req.body.question2,
      question3: JSON.parse(req.body.question3),
      question4: req.body.question4,
      question5: req.body.question5,
      photoUrl: `/uploads/${req.file.filename}`
    };

    const survey = new Survey(surveyData);
    await survey.save();

    res.status(201).json({ 
      message: 'Survey submitted successfully!',
      survey: survey
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ submittedAt: -1 });
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 