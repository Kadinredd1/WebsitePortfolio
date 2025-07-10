# Portfolio Website

A modern, interactive portfolio website built with React, TypeScript, and Node.js with MongoDB backend.

## Features

- **Interactive Project Showcase**: Click-to-expand project cards with detailed modals
- **Add Project Form**: Comprehensive form to add new projects with image upload
- **GitHub Integration**: Display GitHub stats and contribution graphs
- **Modern UI**: Glassmorphism design with smooth animations
- **Responsive Design**: Works perfectly on all devices
- **Full-Stack**: Complete backend with MongoDB database

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- SCSS for modular styling
- Modern CSS features (Grid, Flexbox, Animations)

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Multer for file uploads
- CORS enabled for frontend integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd my-portfolio
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create a database named `portfolio`

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
```

### 3. Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Start the Frontend

```bash
# In a new terminal, from the my-portfolio directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## Project Structure

```
my-portfolio/
├── src/
│   ├── components/
│   │   ├── App.tsx          # Main app component
│   │   ├── Projects.tsx     # Projects display
│   │   ├── GitHub.tsx       # GitHub integration
│   │   └── AddProject.tsx   # Add project form
│   ├── styles/
│   │   ├── navigation.scss  # Navigation styles
│   │   ├── projects.scss    # Project card styles
│   │   ├── addProject.scss  # Form styles
│   │   └── github.scss      # GitHub component styles
│   └── index.css           # Global styles
├── backend/
│   ├── models/
│   │   └── Project.js      # MongoDB schema
│   ├── routes/
│   │   └── projects.js     # API routes
│   ├── uploads/            # Image uploads directory
│   └── server.js           # Express server
└── package.json
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (with image upload)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Health Check
- `GET /api/health` - Server health status

## Usage

### Adding Projects
1. Navigate to the "Add Project" tab
2. Fill out the comprehensive form including:
   - Basic project information
   - Technologies used
   - Project features, challenges, and learnings
   - Upload project screenshot
3. Submit the form to save to database

### Viewing Projects
1. Navigate to the "Projects" tab
2. Click on any project card to view details
3. Use "Show More" to expand descriptions
4. Click GitHub/Demo links to visit projects

## Development

### Frontend Development
- Hot reload with Vite
- TypeScript for type safety
- SCSS modules for styling
- Component-based architecture

### Backend Development
- Nodemon for auto-restart
- MongoDB with Mongoose ODM
- File upload handling
- RESTful API design

## Deployment

### Frontend
- Build with `npm run build`
- Deploy to Vercel, Netlify, or GitHub Pages

### Backend
- Deploy to Heroku, Railway, or DigitalOcean
- Set environment variables for production
- Use MongoDB Atlas for database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own portfolio!
