// Main application state and initialization
class PortfolioApp {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.currentProjectIndex = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleProjects();
        this.renderProjects();
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showSection(e.target.dataset.section));
        });

        // Form submission
        document.getElementById('projectForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('prevProject').addEventListener('click', () => this.previousProject());
        document.getElementById('nextProject').addEventListener('click', () => this.nextProject());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Click outside modal to close
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Mouse movement animation
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section and activate button
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    handleKeydown(e) {
        if (document.getElementById('projectModal').classList.contains('active')) {
            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.key === 'ArrowLeft') {
                this.previousProject();
            } else if (e.key === 'ArrowRight') {
                this.nextProject();
            }
        }
    }

    handleMouseMove(e) {
        const shapes = document.querySelectorAll('.floating-shape');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.02;
            const moveX = (x - 0.5) * 100 * speed;
            const moveY = (y - 0.5) * 100 * speed;
            
            shape.style.transform += ` translate(${moveX}px, ${moveY}px)`;
        });
    }

    loadSampleProjects() {
        // This would typically load from a JSON file or API
        this.projects = [
            {
                id: 1,
                title: "E-Commerce Platform",
                description: "A comprehensive full-stack e-commerce solution built with modern web technologies...",
                technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
                projectURL: "https://github.com/yourname/ecommerce",
                demoURL: "https://ecommerce-demo.com",
                date: "2024-01-15",
                image: null
            },
            {
                id: 2,
                title: "Data Visualization Dashboard", 
                description: "An interactive dashboard for comprehensive data analytics...",
                technologies: ["React", "D3.js", "Python", "FastAPI"],
                projectURL: "https://github.com/yourname/dashboard",
                demoURL: "https://dashboard-demo.com", 
                date: "2024-02-20",
                image: null
            }
        ];
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            title: formData.get('projectTitle'),
            description: formData.get('projectDescription'),
            technologies: formData.get('projectTech'),
            projectURL: formData.get('projectURL'),
            demoURL: formData.get('projectDemo'),
            date: formData.get('projectDate'),
            image: null
        };
        
        // Handle image upload
        const imageFile = formData.get('projectImage');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                projectData.image = e.target.result;
                this.addProject(projectData);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.addProject(projectData);
        }
    }

    addProject(projectData) {
        const newProject = {
            id: Date.now(),
            ...projectData,
            technologies: projectData.technologies.split(',').map(t => t.trim()).filter(t => t)
        };
        
        this.projects.push(newProject);
        this.renderProjects();
        this.clearForm();
        this.showSection('projects');
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = '';

        this.projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });
    }

    createProjectCard(project, index) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.addEventListener('click', () => this.openModal(index));
        
        projectCard.innerHTML = `
            <div class="project-image" style="${project.image ? `background-image: url(${project.image}); background-size: cover; background-position: center;` : ''}">
                ${!project.image ? '📸 Screenshot will appear here' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${this.truncateText(project.description, 100)}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        `;
        
        return projectCard;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    clearForm() {
        const form = document.getElementById('projectForm');
        form.reset();
    }

    openModal(index) {
        this.currentProjectIndex = index;
        const project = this.projects[index];
        
        this.populateModal(project);
        document.getElementById('projectModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('projectModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    previousProject() {
        const totalProjects = this.projects.length;
        this.currentProjectIndex = (this.currentProjectIndex - 1 + totalProjects) % totalProjects;
        this.openModal(this.currentProjectIndex);
    }

    nextProject() {
        const totalProjects = this.projects.length;
        this.currentProjectIndex = (this.currentProjectIndex + 1) % totalProjects;
        this.openModal(this.currentProjectIndex);
    }

    populateModal(project) {
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('modalDescription').textContent = project.description;
        
        // Handle image
        const modalImage = document.getElementById('modalImage');
        if (project.image) {
            modalImage.style.backgroundImage = `url(${project.image})`;
            modalImage.style.backgroundSize = 'cover';
            modalImage.style.backgroundPosition = 'center';
            modalImage.textContent = '';
        } else {
            modalImage.style.backgroundImage = '';
            modalImage.textContent = '📸 Project Screenshot';
        }
        
        // Tech tags
        const modalTech = document.getElementById('modalTech');
        modalTech.innerHTML = project.technologies.map(tech => 
            `<span class="modal-tech-tag">${tech}</span>`
        ).join('');
        
        // Project details
        this.populateModalDetails(project);
    }

    populateModalDetails(project) {
        const modalDetails = document.getElementById('modalDetails');
        let detailsHTML = '';
        
        if (project.date) {
            detailsHTML += `
                <div class="modal-detail-item">
                    <div class="modal-detail-label">Project Date</div>
                    <div class="modal-detail-value">${new Date(project.date).toLocaleDateString()}</div>
                </div>
            `;
        }
        
        if (project.projectURL) {
            detailsHTML += `
                <div class="modal-detail-item">
                    <div class="modal-detail-label">Source Code</div>
                    <div class="modal-detail-value"><a href="${project.projectURL}" target="_blank">View on GitHub</a></div>
                </div>
            `;
        }
        
        if (project.demoURL) {
            detailsHTML += `
                <div class="modal-detail-item">
                    <div class="modal-detail-label">Live Demo</div>
                    <div class="modal-detail-value"><a href="${project.demoURL}" target="_blank">View Live Project</a></div>
                </div>
            `;
        }
        
        modalDetails.innerHTML = detailsHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});