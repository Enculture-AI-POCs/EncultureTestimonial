const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Survey Schema
const surveySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  question2: { 
    type: String, 
    required: true,
    trim: true
  },
  question3: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one option must be selected'
    }
  },
  question4: { 
    type: String, 
    required: true,
    trim: true
  },
  question5: { 
    type: String, 
    required: true,
    trim: true
  },
  photoUrl: { 
    type: String, 
    required: false
  },
  photoFileName: {
    type: String,
    required: false
  },
  photoData: {
    type: String,
    required: false
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  archived: {
    type: Boolean,
    default: false
  }
});

// Create indexes for better performance
surveySchema.index({ email: 1 });
surveySchema.index({ submittedAt: -1 });
surveySchema.index({ question3: 1 });

const Survey = mongoose.model('Survey', surveySchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `photo-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

class SurveyService {
  /**
   * Save survey data with photo to MongoDB
   * @param {Object} surveyData - Survey form data
   * @param {Object} file - Uploaded photo file
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} Saved survey object
   */
  static async saveSurvey(surveyData, file, req) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'question2', 'question3', 'question4', 'question5'];
      for (const field of requiredFields) {
        if (!surveyData[field] || (Array.isArray(surveyData[field]) && surveyData[field].length === 0)) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(surveyData.email)) {
        throw new Error('Invalid email format');
      }

      // Photo is now optional
      let photoUrl = null;
      let photoFileName = null;
      let photoData = null;

      if (file) {
        // Convert photo to base64
        const photoBuffer = fs.readFileSync(file.path);
        const photoBase64 = photoBuffer.toString('base64');
        const photoMimeType = file.mimetype;
        photoData = `data:${photoMimeType};base64,${photoBase64}`;
        photoUrl = `/uploads/${file.filename}`;
        photoFileName = file.filename;
      }

      // Create survey object
      const survey = new Survey({
        name: surveyData.name.trim(),
        email: surveyData.email.trim().toLowerCase(),

        question2: surveyData.question2.trim(),
        question3: Array.isArray(surveyData.question3) ? surveyData.question3 : JSON.parse(surveyData.question3),
        question4: surveyData.question4.trim(),
        question5: surveyData.question5.trim(),
        photoUrl: photoUrl,
        photoFileName: photoFileName,
        photoData: photoData,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      // Save to database
      const savedSurvey = await survey.save();

      return {
        success: true,
        message: 'Survey submitted successfully!',
        survey: savedSurvey
      };

    } catch (error) {
      console.error('Error saving survey:', error);
      throw new Error(error.message || 'Failed to save survey');
    }
  }

  /**
   * Get all surveys with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Surveys with pagination info
   */
  static async getSurveys(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
        search = '',
        filterBy = {}
      } = options;

      // Build query
      let query = { archived: { $ne: true } };
      
      // Search functionality
      if (search) {
        query.$and = [
          { archived: { $ne: true } },
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { question2: { $regex: search, $options: 'i' } },
              { question4: { $regex: search, $options: 'i' } }
            ]
          }
        ];
      }

      // Apply filters
      if (filterBy.question3 && filterBy.question3.length > 0) {
        query.question3 = { $in: filterBy.question3 };
      }

      if (filterBy.question5) {
        query.question5 = filterBy.question5;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query
      const surveys = await Survey.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Survey.countDocuments(query);

      return {
        success: true,
        surveys,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw new Error('Failed to fetch surveys');
    }
  }

  /**
   * Get survey statistics
   * @returns {Promise<Object>} Survey statistics
   */
  static async getStatistics() {
    try {
      const totalSubmissions = await Survey.countDocuments({ archived: { $ne: true } });
      
      // Calculate today's submissions (from midnight today to now)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todaySubmissions = await Survey.countDocuments({
        archived: { $ne: true },
        submittedAt: {
          $gte: todayStart,
          $lte: todayEnd
        }
      });

      // Calculate this month's submissions (from 1st of current month to now)
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const thisMonthEnd = new Date();
      thisMonthEnd.setHours(23, 59, 59, 999);
      
      const thisMonthSubmissions = await Survey.countDocuments({
        archived: { $ne: true },
        submittedAt: {
          $gte: thisMonthStart,
          $lte: thisMonthEnd
        }
      });

      // Get question3 (services) statistics
      const serviceStats = await Survey.aggregate([
        { $unwind: '$question3' },
        { $group: { _id: '$question3', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get question5 (permission) statistics
      const permissionStats = await Survey.aggregate([
        { $group: { _id: '$question5', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalSubmissions,
        today: todaySubmissions,
        thisMonth: thisMonthSubmissions,
        serviceStats,
        permissionStats
      };

    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  /**
   * Get a survey by ID
   * @param {string} surveyId - Survey ID to retrieve
   * @returns {Promise<Object>} Survey object
   */
  static async getSurveyById(surveyId) {
    try {
      const survey = await Survey.findById(surveyId);
      return survey;
    } catch (error) {
      console.error('Error fetching survey by ID:', error);
      throw new Error('Failed to fetch survey');
    }
  }

  /**
   * Archive survey by ID
   * @param {string} surveyId - Survey ID
   * @returns {Promise<Object>} Archive result
   */
  static async archiveSurvey(surveyId) {
    try {
      const survey = await Survey.findById(surveyId);
      
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Archive the survey instead of deleting
      await Survey.findByIdAndUpdate(surveyId, { archived: true });

      return {
        success: true,
        message: 'Survey archived successfully'
      };

    } catch (error) {
      console.error('Error archiving survey:', error);
      throw new Error(error.message || 'Failed to archive survey');
    }
  }

  /**
   * Get multer upload middleware
   * @returns {Object} Multer upload middleware
   */
  static getUploadMiddleware() {
    return upload.single('photo');
  }
}

module.exports = {
  SurveyService,
  Survey
}; 