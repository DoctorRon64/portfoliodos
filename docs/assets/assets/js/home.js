import { createProjectLink, renderTags, generateThumbnails } from '../assets/js/uiUtils.js';

export function init() {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(projects => {
            window.loadedProjects = projects;
            const container = document.getElementById('project-list');

            projects.forEach((project, i) => {
                const projectCard = createProjectCard(project, i);
                container.appendChild(projectCard);
            });
        })
        .catch(err => {
            console.error('Failed to load projects:', err);
        });

    function createMainMedia(id, src, alt = 'Main Project Image', isModal = false) {
        const fallback = '/assets/img/placeholder.png';
        const validSrc = src || fallback;
        const isVideo = /\.(mp4|webm|ogg)$/i.test(validSrc);

        const mediaHTML = isVideo
            ? `<video id="${id}" src="${validSrc}" autoplay loop muted playsinline controls aria-label="${alt}" class="main-image"></video>`
            : `<img id="${id}" src="${validSrc}" alt="${alt}" loading="lazy" class="main-image" />`;

        return isModal
            ? `<div class="main-image-wrapper">${mediaHTML}</div>` // No overlay in modal
            : `<div class="main-image-wrapper">${mediaHTML}<div class="main-image-overlay"><i class="eye-icon"></i></div></div>`;
    }

    function createProjectCard(project, i, isModal = false) {
        const mainId = isModal ? 'modal-main-image' : `main-image-${i}`;
        const tagsHTML = renderTags(project.tags);
        const mainMediaHTML = createMainMedia(mainId, project.mainvisual, project.title, isModal);

        const modalMeta = isModal ? `
            <div class="modal-header">
                <h2 class="project-title">${project.title}</h2>
                <button class="close-modal" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                ${mainMediaHTML}
                <div class="modal-details">
                    <p class="description">${project.description || 'N/A'}</p>
                    <ul class="meta-list">
                        <li><strong>Date:</strong> ${project.date || 'N/A'}</li>
                        <li><strong>Duration:</strong> ${project.duration || 'N/A'}</li>
                        <li><strong>Team Size:</strong> ${project.teamSize || 'N/A'}</li>
                        <li><strong>Role:</strong> ${project.role || 'N/A'}</li>
                        <li><strong>Status:</strong> ${project.status || 'N/A'}</li>
                    </ul>
                    <div class="project-actions"></div>
                </div>
            </div>

        ` : '';

        const container = document.createElement('div');
        container.className = isModal ? '' : 'thumbnail';
        if (!isModal) container.style.setProperty('--i', i);

        container.innerHTML = `
        ${isModal ? '' : `<h2 class="project-title">${project.title}</h2>`}
        ${isModal ? '' : mainMediaHTML}
        <div class="project-card-content">
        <div class="small-thumbnails"></div>
        <div class="bottom-row">
        <div class="tags">${tagsHTML}</div>
        </div>
        <div class="project-actions"></div>
        </div>
        ${modalMeta}
        `;

        // Append project links
        const linksContainer = container.querySelector('.project-actions');
        if (Array.isArray(project.link)) {
            project.link.forEach(url => {
                linksContainer.appendChild(createProjectLink(url));
            });
        }

        // Populate thumbnails
        const thumbsContainer = container.querySelector('.small-thumbnails');
        if (thumbsContainer) {
            thumbsContainer.appendChild(generateThumbnails(
                [project.mainvisual, ...(project.extravisuals || [])],
                mainId,
                i,
                isModal ? replaceModalMainMedia : replaceMainMedia
            ));
            highlightThumbnail(thumbsContainer, mainId);
        }

        // Modal opening
        if (!isModal) {
            const wrapper = container.querySelector('.main-image-wrapper');
            if (wrapper) {
                wrapper.style.cursor = 'pointer';
                wrapper.onclick = () => openProject(i);
            }
        }

        return container;
    }

    function replaceMainMedia(elementId, src) {
        replaceMedia(elementId, src);
    }

    function replaceModalMainMedia(elementId, src) {
        replaceMedia(elementId, src);
    }

    function replaceMedia(elementId, src) {
        const container = document.getElementById(elementId)?.parentNode;
        if (!container) return;

        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
        const newMedia = isVideo
            ? Object.assign(document.createElement('video'), {
                src,
                autoplay: true,
                loop: true,
                muted: true,
                playsInline: true,
                controls: true,
                className: 'main-image',
                id: elementId,
                'aria-label': 'Main Project Video'
            })
            : Object.assign(document.createElement('img'), {
                src,
                alt: 'Main Project Image',
                className: 'main-image',
                id: elementId
            });

        const old = document.getElementById(elementId);
        if (old) container.replaceChild(newMedia, old);
    }

    function openProject(id) {
        const modal = document.getElementById('projectModal');
        const content = modal.querySelector('.modal-content');
        const project = window.loadedProjects[id];
        if (!project) return;

        content.innerHTML = '';

        const modalCard = createProjectCard(project, id, true);
        content.appendChild(modalCard);

        // Add close button dynamically
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-modal';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeModal;
        content.appendChild(closeBtn);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function highlightThumbnail(thumbsContainer, mainId) {
        thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(wrapper => {
            const img = wrapper.querySelector('.small-thumb');
            if (!img) return;

            wrapper.onclick = () => {
                thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(w => {
                    const i = w.querySelector('.small-thumb');
                    if (i) i.style.borderColor = 'transparent';
                    w.style.boxShadow = 'none';
                });

                img.style.borderColor = '#3498db';
                wrapper.style.boxShadow = '0 0 12px #3498db';
                replaceMedia(mainId, img.src);
            };
        });
    }

    function closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    window.addEventListener('click', e => {
        const modal = document.getElementById('projectModal');
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}
