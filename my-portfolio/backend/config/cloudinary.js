import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary automatically detects and uses CLOUDINARY_URL environment variable
// No additional configuration needed when using CLOUDINARY_URL
export default cloudinary; 