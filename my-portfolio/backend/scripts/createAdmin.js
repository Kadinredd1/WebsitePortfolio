import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists and delete it to recreate
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists, deleting old admin...');
      await Admin.deleteOne({ role: 'super_admin' });
    }

    // Create super admin
    const superAdmin = new Admin({
      username: 'Kdredd03',
      email: 'kadinredd08@gmail.com',
      password: 'Reddman23!', // Change this in production!
      role: 'super_admin',
      isActive: true
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully!');
    console.log('📧 Username: Kdredd03');
    console.log('📧 Email: kadinredd08@gmail.com');
    console.log('🔑 Password: Reddman23!');
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin(); 