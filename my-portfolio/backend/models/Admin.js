import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: false, // Optional for GitHub OAuth users
    unique: true,
    sparse: true, // Allow multiple null values
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // If email is provided, it must be a valid email format
        if (v) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        }
        return true; // Allow null/undefined emails
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: false, // Optional for GitHub OAuth
    minlength: 6
  },
  // GitHub OAuth fields
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubUsername: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Validate that admin has either password or GitHub ID
adminSchema.pre('save', async function(next) {
  if (!this.password && !this.githubId) {
    return next(new Error('Admin must have either a password or GitHub ID'));
  }
  
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
adminSchema.methods.toPublicJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin; 