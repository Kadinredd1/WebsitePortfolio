import React from 'react';
import '../styles/landing.scss';

const LandingPage: React.FC = () => (
  <div className="landing-container">
    <h1 className="landing-title">Full Stack Developer</h1>
    <p className="landing-desc">
    Full-stack developer with a passion for building scalable, user-focused solutions. Backed by 4+ software engineering internships across 5 years, I've developed a strong foundation in both frontend and backend technologies with a focus on clean code, cross-functional collaboration, and continuous learning.
    </p>
    <p className="landing-portfolio-desc">
      This is a personal portfolio website I built from scratch using React, TypeScript, Node.js, Express, MongoDB Atlas, and SCSS. Features include JWT authentication, image processing, responsive design, admin panel for content management, and cloud deployment on Vercel and Render.
    </p>
  </div>
);

export default LandingPage; 
