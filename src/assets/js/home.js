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

    function createMainMedia(id, src, alt = 'Main Project Image') {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
        if (isVideo) {
            return `
                <video id="${id}" src="${src}" autoplay loop muted playsinline controls class="main-image"></video>
            `;
        }
        return `
            <img id="${id}" src="${src}" alt="${alt}" loading="lazy" class="main-image" />
        `;
    }

    function createProjectCard(project, i, isModal = false) {
        const mainId = isModal ? 'modal-main-image' : `main-image-${i}`;
        const tagsHTML = renderTags(project.tags);

        const mainMediaHTML = createMainMedia(mainId, project.mainvisual, project.title);
        const buttonClass = isModal ? 'close-project-btn' : 'open-project-btn';
        const buttonText = isModal ? 'Close' : 'Open';
        const buttonColor = isModal ? 'rgb(255, 55, 0)' : 'rgb(0, 183, 255)';
        const modalMeta = isModal ? `
            <div class="project-meta">
                <div class="description">${project.description || 'N/A'}</div>
                <p><strong>Date:</strong> ${project.date || 'N/A'}</p>
                <p><strong>Duration:</strong> ${project.duration || 'N/A'}</p>
                <p><strong>Team Size:</strong> ${project.teamSize || 'N/A'}</p>
                <p><strong>Role:</strong> ${project.role || 'N/A'}</p>
                <p><strong>Status:</strong> ${project.status || 'N/A'}</p>
            </div>
        ` : '';

        const container = document.createElement('div');
        container.className = isModal ? '' : 'thumbnail';
        if (!isModal) container.style.setProperty('--i', i);

        container.innerHTML = `
        ${mainMediaHTML}
        <h2 class="project-title">${project.title}</h2>
        <div class="project-card-content">
            <div class="small-thumbnails"></div>
            <div class="bottom-row">
                <div class="tags">${tagsHTML}</div>
            </div>
            <div class="project-actions">
                <a class="${buttonClass} btn" style="--bg-color: ${buttonColor}; --button-height: 2.1rem;" data-id="${i}">${buttonText}</a>
            </div>
        </div>
        ${modalMeta}
    `;

        // Append project links inside the .project-actions div
        const linksContainer = container.querySelector('.project-actions');
        if (Array.isArray(project.link)) {
            project.link.forEach(url => {
                linksContainer.appendChild(createProjectLink(url));
            });
        }

        // Populate thumbnails inside the existing small-thumbnails div
        const thumbsContainer = container.querySelector('.small-thumbnails');
        thumbsContainer.appendChild(generateThumbnails(
            [project.mainvisual, ...(project.extravisuals || [])],
            mainId,
            i,
            isModal ? replaceModalMainMedia : replaceMainMedia
        ));
        highlightThumbnail(thumbsContainer, mainId);

        // Button click handler
        const btn = container.querySelector(`.${buttonClass}`);
        if (btn) {
            btn.onclick = isModal ? closeModal : () => openProject(i);
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
        const container = document.getElementById(elementId).parentNode;
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
                id: elementId
            })
            : Object.assign(document.createElement('img'), {
                src,
                alt: 'Main Project Image',
                className: 'main-image',
                id: elementId
            });

        const old = document.getElementById(elementId);
        container.replaceChild(newMedia, old);
    }

    function openProject(id) {
        const modal = document.getElementById('projectModal');
        const content = modal.querySelector('.modal-content');
        const project = window.loadedProjects[id];
        if (!project) return;

        // Clear previous content
        content.innerHTML = '';

        // Create modal project card and append to modal content
        const modalCard = createProjectCard(project, id, true);
        content.appendChild(modalCard);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Setup close button in modal header/footer if exists (optional)
        const extraCloseBtn = modal.querySelector('.close-modal');
        if (extraCloseBtn) {
            extraCloseBtn.onclick = closeModal;
        }
    }

    function highlightThumbnail(thumbsContainer, mainId) {
        thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(wrapper => {
            wrapper.onclick = () => {
                thumbsContainer.querySelectorAll('.small-thumb-wrapper').forEach(w => {
                    w.querySelector('.small-thumb').style.borderColor = 'transparent';
                    w.style.boxShadow = 'none';
                });
                const img = wrapper.querySelector('.small-thumb');
                img.style.borderColor = '#3498db'; // or $primary-color hex code
                wrapper.style.boxShadow = '0 0 12px #3498db';
                // replace main media
                const src = img.src;
                replaceMedia(mainId, src);
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
