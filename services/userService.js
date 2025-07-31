const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

class UserService {
  /**
   * Initialize default admin user
   */
  static async initializeDefaultUser() {
    try {
      const existingUser = await User.findOne({ email: 'ram@enculture.ai' });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('Test@1234', 10);
        
        const defaultUser = new User({
          email: 'ram@enculture.ai',
          password: hashedPassword,
          name: 'Ram',
          role: 'admin'
        });
        
        await defaultUser.save();
        console.log('Default admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating default user:', error);
    }
  }

  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  static async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

module.exports = {
  UserService,
  User
}; 