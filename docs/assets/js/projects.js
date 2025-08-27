import { tagsMap, tagsIconMap } from './tagsMap.js';

export function initProjects(lang = 'en') {
    // Load projects data
    fetch('../../data/projects.json')
        .then(res => res.json())
        .then(projects => {
            const allProjects = projects[lang] || projects['en'];
            renderProjectsList(allProjects);
        })
        .catch(err => {
            console.error('Failed to load projects:', err);
        });

    // Load home data for labels
    fetch('../../data/home.json')
        .then(res => res.json())
        .then(homeData => {
            const data = homeData[lang] || homeData['en'];
            if (data && data.labels) {
                window.labels = data.labels;
            }
        })
        .catch(err => {
            console.error('Failed to load home data:', err);
        });
}

function updateNavigation(data) {
    if (data.nav) {
        const logo = document.getElementById('nav-logo');
        if (logo) logo.textContent = data.nav.logo;

        const navProjects = document.getElementById('nav-projects');
        if (navProjects) navProjects.textContent = data.nav.projects;

        const navAbout = document.getElementById('nav-about');
        if (navAbout) navAbout.textContent = data.nav.about;

        const navContact = document.getElementById('nav-contact');
        if (navContact) navContact.textContent = data.nav.contact;
    }
}

function renderProjectsList(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = '';

    projects.forEach(project => {
        const projectItem = createProjectListItem(project);
        container.appendChild(projectItem);
    });
}

function createProjectListItem(project) {
    const item = document.createElement('div');
    item.className = 'project-item';

    // Determine if main visual is a video, gif, or image
    const isVideo = project.mainvisual && (
        project.mainvisual.includes('.mp4') ||
        project.mainvisual.includes('.webm')
    );

    const isGif = project.mainvisual && project.mainvisual.includes('.gif');

    let thumbnailHTML;
    if (isVideo) {
        thumbnailHTML = `<video class="project-thumbnail" muted loop><source src="${project.mainvisual}" type="video/mp4"></video>`;
    } else if (isGif) {
        thumbnailHTML = `<img class="project-thumbnail" src="${project.mainvisual}" alt="${project.title}" style="pointer-events: none;">`;
    } else {
        thumbnailHTML = `<img class="project-thumbnail" src="${project.mainvisual}" alt="${project.title}">`;
    }

    item.innerHTML = `
        <div class="project-header">
            ${thumbnailHTML}
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <div class="project-meta">
                    <span>📅 ${project.date}</span>
                    <span>⏱️ ${project.duration}</span>
                    <span>👥 ${project.teamSize}</span>
                    <span>🎭 ${project.role}</span>
                    <span>📊 ${project.status}</span>
                </div>
            </div>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
            ${project.tags ? project.tags.map(tag => {
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
    }).join('') : ''}
        </div>
    `;

    // Add click event to open project modal
    item.addEventListener('click', () => {
        openProjectModal(project);
    });

    return item;
}

function openProjectModal(project) {
    // Create modal content
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    // Update modal content
    updateModalContent(project);

    // Show modal
    modal.classList.add('open');

    // Add event listeners
    modal.querySelector('.close-modal').onclick = closeProjectModal;

    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

function updateModalContent(project) {
    const modal = document.getElementById('projectModal');

    // Update project title and description
    const title = modal.querySelector('#modal-project-title');
    if (title) title.textContent = project.title;

    const desc = modal.querySelector('#modal-project-description');
    if (desc) desc.textContent = project.description;

    // Update main media
    const mainVideo = modal.querySelector('#main-video');
    const mainImage = modal.querySelector('#main-image');

    if (project.mainvisual) {
        const isVideo = project.mainvisual.includes('.mp4') || project.mainvisual.includes('.webm');
        const isGif = project.mainvisual.includes('.gif');

        if (isVideo) {
            mainVideo.style.display = 'block';
            mainImage.style.display = 'none';
            mainVideo.src = project.mainvisual;
        } else {
            mainImage.style.display = 'block';
            mainVideo.style.display = 'none';
            mainImage.src = project.mainvisual;
        }
    }

    // Update thumbnails
    updateModalThumbnails(project);

    // Update tags
    updateModalTags(project);

    // Update links
    updateModalLinks(project);

    // Update extra info
    updateModalExtraInfo(project);
}

function updateModalThumbnails(project) {
    const container = document.getElementById('thumbnails-container');
    if (!container) return;

    container.innerHTML = '';

    // Add main visual as first thumbnail
    const visuals = [project.mainvisual, ...(project.extravisuals || [])];

    visuals.forEach((visual, index) => {
        if (!visual) return;

        const isVideo = visual.includes('.mp4') || visual.includes('.webm');
        const isGif = visual.includes('.gif');

        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-item';
        if (index === 0) thumbnail.classList.add('active');

        if (isVideo) {
            thumbnail.innerHTML = `
                <video src="${visual}" muted loop></video>
                <div class="media-type-indicator">VID</div>
            `;
        } else if (isGif) {
            thumbnail.innerHTML = `
                <img src="${visual}" alt="Thumbnail ${index + 1}">
                <div class="media-type-indicator">GIF</div>
            `;
        } else {
            thumbnail.innerHTML = `
                <img src="${visual}" alt="Thumbnail ${index + 1}">
            `;
        }

        thumbnail.onclick = () => switchMainMedia(visual, isVideo, isGif);
        container.appendChild(thumbnail);
    });
}

function switchMainMedia(visual, isVideo, isGif) {
    const mainVideo = document.getElementById('main-video');
    const mainImage = document.getElementById('main-image');

    if (isVideo) {
        mainVideo.style.display = 'block';
        mainImage.style.display = 'none';
        mainVideo.src = visual;
    } else {
        mainImage.style.display = 'block';
        mainVideo.style.display = 'none';
        mainImage.src = visual;
    }

    // Update active thumbnail
    document.querySelectorAll('.thumbnail-item').forEach((item, index) => {
        item.classList.remove('active');
        if (item.querySelector('img')?.src === visual || item.querySelector('video')?.src === visual) {
            item.classList.add('active');
        }
    });
}

function updateModalTags(project) {
    const container = document.getElementById('modal-tags');
    if (!container) return;

    container.innerHTML = '';

    if (project.tags) {
        project.tags.forEach(tag => {
            const tagElement = document.createElement('span');

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

            tagElement.className = `tag ${tagCategory}`;

            if (isGradient) {
                tagElement.style.setProperty('--tag-gradient', color);
                tagElement.style.background = color;
            } else {
                tagElement.style.backgroundColor = color;
            }

            // Voeg icoon toe als het bestaat
            if (icon) {
                const iconImg = document.createElement('img');
                iconImg.src = `/assets/img/icons/${icon}`;
                iconImg.className = 'tag-icon';
                iconImg.alt = `${tag} icon`;
                tagElement.appendChild(iconImg);
            }

            // Voeg tekst toe
            const textNode = document.createTextNode(tag);
            tagElement.appendChild(textNode);

            container.appendChild(tagElement);
        });
    }
}

function updateModalLinks(project) {
    const container = document.getElementById('modal-links');
    if (!container) return;

    container.innerHTML = '';

    if (project.link) {
        project.link.forEach((url, index) => {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.className = 'btn';

            // Determine button type based on URL
            if (url.includes('github.com')) {
                // Check if it's a release (build) or source code
                if (url.includes('/releases') || url.includes('/releases/tag/') || url.includes('/releases/latest')) {
                    link.className += ' btn-github-release';
                    link.textContent = 'Download Build';
                } else {
                    link.className += ' btn-github';
                    link.textContent = 'Source Code';
                }
            } else if (url.includes('itch.io')) {
                link.className += ' btn-itchio';
                link.textContent = 'Download Game';
            } else {
                link.className += ' btn-primary';
                link.textContent = `Link ${index + 1}`;
            }

            container.appendChild(link);
        });
    }
}

function updateModalExtraInfo(project) {
    const container = document.getElementById('modal-extra-info');
    if (!container) return;

    container.innerHTML = '';

    const infoItems = [
        { label: 'Date', value: project.date },
        { label: 'Duration', value: project.duration },
        { label: 'Team Size', value: project.teamSize },
        { label: 'Role', value: project.role },
        { label: 'Status', value: project.status }
    ];

    infoItems.forEach(item => {
        if (item.value) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
            container.appendChild(li);
        }
    });
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('open');
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
}
