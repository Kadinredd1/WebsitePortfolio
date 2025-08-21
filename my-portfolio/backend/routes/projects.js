import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';
import Project from '../models/Project.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
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

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'portfolio') => {
  try {
    // Resize image for project cards
    const resizedBuffer = await sharp(file.buffer)
      .resize(600, 450, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 600, height: 450, crop: 'fill' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(resizedBuffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Parse JSON arrays from form data
const parseJsonArrays = (data) => {
  return {
    technologies: data.technologies ? JSON.parse(data.technologies) : [],
    features: data.features ? JSON.parse(data.features) : [],
    challenges: data.challenges ? JSON.parse(data.challenges) : [],
    lessons: data.lessons ? JSON.parse(data.lessons) : []
  };
};

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

// POST create new project
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), upload.array('images'), async (req, res) => {
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

    const parsedArrays = parseJsonArrays(req.body);

    // Create project data
    const projectData = {
      title,
      description,
      longDescription,
      technologies: parsedArrays.technologies,
      projectURL,
      demoURL,
      status,
      completion: parseInt(completion) || 0,
      features: parsedArrays.features,
      challenges: parsedArrays.challenges,
      lessons: parsedArrays.lessons
    };

    // Upload images to Cloudinary if files were uploaded
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file, 'portfolio');
        imageUrls.push(imageUrl);
      }
      
      projectData.images = imageUrls;
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

// PUT update project
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), upload.array('images'), async (req, res) => {
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

    const parsedArrays = parseJsonArrays(req.body);

    const updateData = {
      title,
      description,
      longDescription,
      technologies: parsedArrays.technologies,
      projectURL,
      demoURL,
      status,
      completion: parseInt(completion) || 0,
      features: parsedArrays.features,
      challenges: parsedArrays.challenges,
      lessons: parsedArrays.lessons
    };

    // Upload new images to Cloudinary if files were uploaded
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file, 'portfolio');
        imageUrls.push(imageUrl);
      }
      
      updateData.images = imageUrls;
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

// DELETE project
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