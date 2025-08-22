import React from 'react';
import '../styles/landing.scss';

const LandingPage: React.FC = () => (
  <div className="landing-container">
    <h1 className="landing-title">Full Stack Developer</h1>
    <p className="landing-desc">
    Full-stack developer with over 4 years of experience building scalable web applications. Passionate about clean code, user experience, and staying current with modern technologies.
    </p>
    <p className="landing-portfolio-desc">
      This is a personal portfolio website I built using React, TypeScript, Node.js, Express, and MongoDB Atlas. Features include JWT authentication, image processing, responsive design, admin panel for content management, GitHub OAuth, and cloud deployment on Vercel and Render.
    </p>
  </div>
);

export default LandingPage; 
