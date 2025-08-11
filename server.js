const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { SurveyService } = require('./services/surveyService');
const { UserService } = require('./services/userService');

const app = express();
const PORT = process.env.PORT || 12345;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  // Initialize default admin user
  await UserService.initializeDefaultUser();
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await UserService.authenticateUser(email, password);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Login successful',
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// API Routes
app.post('/api/survey', SurveyService.getUploadMiddleware(), async (req, res) => {
  try {
    const result = await SurveyService.saveSurvey(req.body, req.file, req);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to submit survey' 
    });
  }
});

app.get('/api/surveys', async (req, res) => {
  try {
    const { page, limit, search, sortBy, sortOrder, filterBy } = req.query;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      sortBy: sortBy || 'submittedAt',
      sortOrder: sortOrder || 'desc',
      filterBy: filterBy ? JSON.parse(filterBy) : {}
    };
    
    const result = await SurveyService.getSurveys(options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch surveys' 
    });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    const result = await SurveyService.getStatistics();
    res.json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics' 
    });
  }
});

app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const result = await SurveyService.archiveSurvey(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error archiving survey:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to archive survey' 
    });
  }
});

// Serve photo from database
app.get('/api/photo/:id', async (req, res) => {
  try {
    const survey = await SurveyService.getSurveyById(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    if (!survey.photoData) {
      return res.status(404).json({ error: 'No photo uploaded for this survey' });
    }
    
    // Extract base64 data
    const base64Data = survey.photoData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

// Serve React app static files
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 