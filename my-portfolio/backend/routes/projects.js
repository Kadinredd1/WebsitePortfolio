import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
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
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// POST create new project (admin only)
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      longDescription,
      technologies,
      projectURL,
      demoURL,
      status,
      completion,
      features,
      challenges,
      lessons
    } = req.body;

    // Parse JSON arrays
    const parsedTechnologies = technologies ? JSON.parse(technologies) : [];
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedChallenges = challenges ? JSON.parse(challenges) : [];
    const parsedLessons = lessons ? JSON.parse(lessons) : [];

    // Create project data
    const projectData = {
      title,
      description,
      longDescription,
      technologies: parsedTechnologies,
      projectURL,
      demoURL,
      status,
      completion: parseInt(completion) || 0,
      features: parsedFeatures,
      challenges: parsedChallenges,
      lessons: parsedLessons
    };

    // Add image URL if file was uploaded
    if (req.file) {
      projectData.image = `/uploads/${req.file.filename}`;
    }

    const project = new Project(projectData);
    const savedProject = await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error.message 
    });
  }
});

// PUT update project (admin only)
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      longDescription,
      technologies,
      projectURL,
      demoURL,
      status,
      completion,
      features,
      challenges,
      lessons
    } = req.body;

    // Parse JSON arrays
    const parsedTechnologies = technologies ? JSON.parse(technologies) : [];
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedChallenges = challenges ? JSON.parse(challenges) : [];
    const parsedLessons = lessons ? JSON.parse(lessons) : [];

    const updateData = {
      title,
      description,
      longDescription,
      technologies: parsedTechnologies,
      projectURL,
      demoURL,
      status,
      completion: parseInt(completion) || 0,
      features: parsedFeatures,
      challenges: parsedChallenges,
      lessons: parsedLessons
    };

    // Add image URL if new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating project', 
      error: error.message 
    });
  }
});

// DELETE project (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting project', 
      error: error.message 
    });
  }
});

export default router; 