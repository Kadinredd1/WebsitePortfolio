// Project-related functionality
class ProjectManager {
    constructor(app) {
        this.app = app;
    }

    addProject(projectData) {
        const newProject = {
            id: Date.now(),
            ...projectData,
            technologies: projectData.technologies.split(',').map(t => t.trim()).filter(t => t)
        };
        
        this.app.projects.push(newProject);
        this.renderProjects();
        this.clearForm();
        this.app.showSection('projects');
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = '';

        this.app.projects.forEach((project, index) => {
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
}