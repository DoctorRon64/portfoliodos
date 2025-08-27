import { createProjectLink, renderTags, generateThumbnails } from './uiUtils.js';
import { tagsMap, tagsIconMap } from './tagsMap.js';

export function init(lang = 'en') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(lang));
        return;
    }

    // Load home data for stats and skills
    fetch('/src/data/home.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(homeData => {
            const data = homeData[lang] || homeData['en'];
            if (!data) {
                console.warn(`Language "${lang}" not found, falling back to English`);
                updateHomeContent(homeData['en']);
            } else {
                updateHomeContent(data);
            }
        })
        .catch(err => {
            console.error('Failed to load home data:', err);
        });

    // Load featured projects
    fetch('/src/data/projects.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(projects => {
            const allProjects = projects[lang] || projects['en'];
            if (!allProjects) {
                console.warn(`Language "${lang}" not found in projects, falling back to English`);
                const featuredProjects = projects['en'].filter(project => project.featured).slice(0, 3);
                renderFeaturedProjects(featuredProjects);
            } else {
                const featuredProjects = allProjects.filter(project => project.featured).slice(0, 3);
                renderFeaturedProjects(featuredProjects);
            }
        })
        .catch(err => {
            console.error('Failed to load projects:', err);
        });
}

function updateHomeContent(data) {
    // Update stats section
    if (data.stats) {
        renderStats(data.stats);
    }

    // Update skills section
    if (data.skills) {
        renderSkills(data.skills);
    }
}


function renderFeaturedProjects(projects) {
    const container = document.getElementById('featured-projects-container');
    if (!container) return;

    container.innerHTML = '';

    projects.forEach(project => {
        const card = createFeaturedProjectCard(project);
        container.appendChild(card);
    });
}

function createFeaturedProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'featured-project-card';

    // Determine if main visual is a video, gif, or image
    const isVideo = project.mainvisual && (
        project.mainvisual.includes('.mp4') ||
        project.mainvisual.includes('.webm')
    );

    const isGif = project.mainvisual && project.mainvisual.includes('.gif');

    let mainVisualHTML;
    if (isVideo) {
        mainVisualHTML = `<video class="project-image" autoplay muted loop><source src="${project.mainvisual}" type="video/mp4"></video>`;
    } else if (isGif) {
        mainVisualHTML = `<img class="project-image" src="${project.mainvisual}" alt="${project.title}" style="pointer-events: none;">`;
    } else {
        mainVisualHTML = `<img class="project-image" src="${project.mainvisual}" alt="${project.title}">`;
    }

    card.innerHTML = `
        ${mainVisualHTML}
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
                <span class="project-date">${project.date}</span>
                <span class="project-status">${project.status}</span>
            </div>
            <div class="project-tags">
                ${project.tags ? project.tags.slice(0, 3).map(tag => {
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
        </div>
    `;

    // Add click event to open project modal
    card.addEventListener('click', () => {
        openProjectModal(project);
    });

    return card;
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
}

function renderStats(stats) {
    const container = document.getElementById('about-stats');
    if (!container) return;

    container.innerHTML = '';

    stats.forEach(stat => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';

        const statNumber = document.createElement('div');
        statNumber.className = 'stat-number';
        statNumber.textContent = stat.number;

        const statLabel = document.createElement('div');
        statLabel.className = 'stat-label';
        statLabel.textContent = stat.label;

        statItem.appendChild(statNumber);
        statItem.appendChild(statLabel);
        container.appendChild(statItem);
    });
}

function renderSkills(skills) {
    const title = document.getElementById('skills-title');
    if (title) title.textContent = skills.title;

    const container = document.getElementById('skills-grid');
    if (!container) return;

    container.innerHTML = '';

    skills.categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.title;

        const skillTags = document.createElement('div');
        skillTags.className = 'skill-tags';

        category.tags.forEach(tag => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = tag;
            skillTags.appendChild(skillTag);
        });

        categoryDiv.appendChild(categoryTitle);
        categoryDiv.appendChild(skillTags);
        container.appendChild(categoryDiv);
    });
}



