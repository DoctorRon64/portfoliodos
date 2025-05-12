function createProjectCell(project) {
    const projectCell = document.createElement('div');
    projectCell.className = 'thumbnail';

    projectCell.innerHTML = `
        <div class="project-title">${project.title}</div>
        <div class="subtitle">${project.description}</div>
        <img id="main-image" src="${project.mainvisual}" alt="Main Project Image">
        <div class="small-thumbnails">
            ${project.extravisuals.map((img, index) => `
                <img class="small" src="${img}" alt="Thumbnail ${index + 1}" onclick="updateBigImage('${img}')">
            `).join('')}
        </div>
        <div class="tags">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <a href="${project.link[0]}" target="_blank">Open Project</a>
        <a href="${project.link[1]}" target="_blank">GitHub Link</a>
        <button onclick="location.href='project-details.html?title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&image=${encodeURIComponent(project.mainvisual)}&tags=${encodeURIComponent(project.tags.join(','))}&duration=${encodeURIComponent(project.duration)}&role=${encodeURIComponent(project.role)}&status=${encodeURIComponent(project.status)}'">View Details</button>
    `;

    return projectCell;
}
