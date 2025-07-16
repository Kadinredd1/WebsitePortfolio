import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import Project from '../models/Project.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Function to upload local image to Cloudinary
const uploadLocalImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'portfolio',
      transformation: [
        { width: 600, height: 450, crop: 'fill' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${imagePath} to Cloudinary:`, error);
    return null;
  }
};

// Function to migrate projects
const migrateProjects = async () => {
  try {
    console.log('Starting migration to Cloudinary...');
    
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to migrate`);
    
    for (const project of projects) {
      console.log(`\nMigrating project: ${project.title}`);
      
      if (project.images && project.images.length > 0) {
        const newImageUrls = [];
        
        for (const imagePath of project.images) {
          // Extract filename from path like "/uploads/resized-image-123.png"
          const filename = path.basename(imagePath);
          const localPath = path.join(__dirname, '../uploads', filename);
          
          // Check if file exists locally
          if (fs.existsSync(localPath)) {
            console.log(`  Uploading ${filename} to Cloudinary...`);
            const cloudinaryUrl = await uploadLocalImageToCloudinary(localPath);
            
            if (cloudinaryUrl) {
              newImageUrls.push(cloudinaryUrl);
              console.log(`  ✓ Uploaded to: ${cloudinaryUrl}`);
            } else {
              console.log(`  ✗ Failed to upload ${filename}`);
            }
          } else {
            console.log(`  ✗ File not found: ${localPath}`);
          }
        }
        
        // Update project with new Cloudinary URLs
        if (newImageUrls.length > 0) {
          project.images = newImageUrls;
          await project.save();
          console.log(`  ✓ Updated project with ${newImageUrls.length} Cloudinary URLs`);
        }
      } else {
        console.log('  No images to migrate');
      }
    }
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateProjects(); 