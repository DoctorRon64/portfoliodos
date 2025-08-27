import { tagsMap, tagsIconMap } from './tagsMap.js';

function createProjectCell(project) {
    const projectCell = document.createElement('div');
    projectCell.className = 'thumbnail';

    const tagHTML = project.tags.map(tag => {
        const color = tagsMap[tag] || '#3b8ac4';
        const icon = tagsIconMap[tag.toLowerCase()] || null;
        const isGradient = color.includes('linear-gradient');

        // Bepaal tag categorie voor styling
        let tagCategory = 'tag-tech';
        if (tag.toLowerCase().includes('photoshop') || tag.toLowerCase().includes('illustrate') || tag.toLowerCase().includes('blender')) {
            tagCategory = 'tag-design';
        } else if (tag.toLowerCase().includes('unity') || tag.toLowerCase().includes('game') || tag.toLowerCase().includes('sfml')) {
            tagCategory = 'tag-game';
        } else if (tag.toLowerCase().includes('cmake') || tag.toLowerCase().includes('tool')) {
            tagCategory = 'tag-tool';
        }

        const iconHTML = icon ? `<img src="/assets/img/icons/${icon}" class="tag-icon" alt="${tag} icon">` : '';

        if (isGradient) {
            return `<span class="tag ${tagCategory}" style="--tag-gradient: ${color}; background: ${color};">${iconHTML}${tag}</span>`;
        } else {
            return `<span class="tag ${tagCategory}" style="background-color: ${color};">${iconHTML}${tag}</span>`;
        }
    }).join('');

    projectCell.innerHTML = `
        <div class="project-title">${project.title}</div>
        <div class="subtitle">${project.description}</div>
        ${(() => {
            const isVideo = project.mainvisual.includes('.mp4') || project.mainvisual.includes('.webm');
            const isGif = project.mainvisual.includes('.gif');

            if (isVideo) {
                return `<video id="main-video" class="main-video" autoplay muted loop><source src="${project.mainvisual}" type="video/mp4"></video>`;
            } else if (isGif) {
                return `<img id="main-image" src="${project.mainvisual}" alt="Main Project Image" style="pointer-events: none;">`;
            } else {
                return `<img id="main-image" src="${project.mainvisual}" alt="Main Project Image">`;
            }
        })()}
        <div class="small-thumbnails">
            ${project.extravisuals.map((img, index) => `
                <img class="small" src="${img}" alt="Thumbnail ${index + 1}" onclick="updateBigImage('${img}')">
            `).join('')}
        </div>
        <div class="tags">
            ${tagHTML}
        </div>
        <a href="${project.link[0]}" target="_blank" class="btn ${project.link[0].includes('itch.io') ? 'btn-itchio' : 'btn-primary'}">${project.link[0].includes('itch.io') ? 'Download Game' : 'Open Project'}</a>
        <a href="${project.link[1]}" target="_blank" class="btn ${project.link[1].includes('github.com') ? (project.link[1].includes('/releases') || project.link[1].includes('/releases/tag/') || project.link[1].includes('/releases/latest') ? 'btn-github-release' : 'btn-github') : 'btn-primary'}">${project.link[1].includes('github.com') ? (project.link[1].includes('/releases') || project.link[1].includes('/releases/tag/') || project.link[1].includes('/releases/latest') ? 'Download Build' : 'Source Code') : 'GitHub Link'}</a>
        <button onclick="location.href='project-details.html?title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&image=${encodeURIComponent(project.mainvisual)}&tags=${encodeURIComponent(project.tags.join(','))}&duration=${encodeURIComponent(project.duration)}&role=${encodeURIComponent(project.role)}&status=${encodeURIComponent(project.status)}'">View Details</button>
    `;

    return projectCell;
}
