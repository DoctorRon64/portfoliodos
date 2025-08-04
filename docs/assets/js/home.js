import { createProjectLink, renderTags, generateThumbnails } from '../assets/js/uiUtils.js';

export function init() {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(projects => {
            window.loadedProjects = projects;
            const container = document.getElementById('project-list');

            projects.forEach((project, i) => {
                const card = createProjectCard(project, i);
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Failed to load projects:', err);
        });

    // ----- Card Creation -----
    function createProjectCard(project, i, isModal = false) {
        const mainId = isModal ? 'modal-main-image' : `main-image-${i}`;
        const mainMediaHTML = createMainMedia(mainId, project.mainvisual, project.title, isModal);

        if (!isModal) {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.setProperty('--i', i);
            card.innerHTML = `${mainMediaHTML}<h2 class="project-title">${project.title}</h2>`;
            card.onclick = () => openProject(i);
            return card;
        }

        const container = document.createElement('div');
        container.className = 'modal-card';
        const tagsHTML = renderTags(project.tags);

        container.innerHTML = `
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
                    <div class="tags">${tagsHTML}</div>
                    <div class="small-thumbnails"></div>
                    <div class="project-actions"></div>
                </div>
            </div>
        `;

        const linksContainer = container.querySelector('.project-actions');
        if (Array.isArray(project.link)) {
            project.link.forEach(url => {
                linksContainer.appendChild(createProjectLink(url));
            });
        }

        const thumbsContainer = container.querySelector('.small-thumbnails');
        if (thumbsContainer) {
            const images = [project.mainvisual, ...(project.extravisuals || [])];
            thumbsContainer.appendChild(generateThumbnails(images, mainId, i, replaceModalMainMedia));
            highlightThumbnail(thumbsContainer, mainId);
        }

        container.querySelector('.close-modal').onclick = closeModal;
        return container;
    }

    // ----- Main/Modal Media -----
    function createMainMedia(id, src, alt = 'Main Project Image', isModal = false) {
        const fallback = '/assets/img/placeholder.png';
        const validSrc = src || fallback;
        const isVideo = /\.(mp4|webm|ogg)$/i.test(validSrc);

        const mediaHTML = isVideo
            ? `<video id="${id}" src="${validSrc}" autoplay loop muted playsinline controls aria-label="${alt}" class="main-image"></video>`
            : `<img id="${id}" src="${validSrc}" alt="${alt}" loading="lazy" class="main-image" />`;

        return isModal
            ? `<div class="main-image-wrapper">${mediaHTML}</div>`
            : `<div class="main-image-wrapper">${mediaHTML}<div class="main-image-overlay"><i class="eye-icon"></i></div></div>`;
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

    const replaceMainMedia = (id, src) => replaceMedia(id, src);
    const replaceModalMainMedia = (id, src) => replaceMedia(id, src);

    // ----- Modal -----
    function openProject(id) {
        const modal = document.getElementById('projectModal');
        const content = modal.querySelector('.modal-content');
        const project = window.loadedProjects[id];
        if (!project) return;

        content.innerHTML = '';
        const modalCard = createProjectCard(project, id, true);
        content.appendChild(modalCard);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ----- Thumbnail Highlighting -----
    function highlightThumbnail(thumbsContainer, mainId) {
        thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(wrapper => {
            const img = wrapper.querySelector('.small-thumb');
            if (!img) return;

            wrapper.onclick = () => {
                thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(w => {
                    const thumb = w.querySelector('.small-thumb');
                    if (thumb) thumb.style.borderColor = 'transparent';
                    w.style.boxShadow = 'none';
                });

                img.style.borderColor = '#3498db';
                wrapper.style.boxShadow = '0 0 12px #3498db';
                replaceMedia(mainId, img.src);
            };
        });
    }

    // ----- Event Listeners -----
    window.addEventListener('click', e => {
        const modal = document.getElementById('projectModal');
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}