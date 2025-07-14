import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  longDescription: {
    type: String,
    required: true,
    trim: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  projectURL: {
    type: String,
    trim: true,
    default: ''
  },
  demoURL: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['live', 'development', 'completed'],
    default: 'development'
  },
  completion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  features: [{
    type: String,
    trim: true
  }],
  challenges: [{
    type: String,
    trim: true
  }],
  lessons: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String, // URLs to stored images
    default: null
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ title: 'text', description: 'text' });

// Virtual for formatted date
projectSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

export default Project; 