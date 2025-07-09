// UI-specific functionality
class UIManager {
    constructor(app) {
        this.app = app;
    }

    openModal(index) {
        this.app.currentProjectIndex = index;
        const project = this.app.projects[index];
        
        this.populateModal(project);
        document.getElementById('projectModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('projectModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    previousProject() {
        const totalProjects = this.app.projects.length;
        this.app.currentProjectIndex = (this.app.currentProjectIndex - 1 + totalProjects) % totalProjects;
        this.openModal(this.app.currentProjectIndex);
    }

    nextProject() {
        const totalProjects = this.app.projects.length;
        this.app.currentProjectIndex = (this.app.currentProjectIndex + 1) % totalProjects;
        this.openModal(this.app.currentProjectIndex);
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