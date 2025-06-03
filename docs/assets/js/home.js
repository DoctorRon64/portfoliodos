import { createProjectLink, renderTags, generateThumbnails } from '../assets/js/uiUtils.js';

export function init() {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(projects => {
            window.loadedProjects = projects;
            const container = document.getElementById('project-list');

            projects.forEach((project, i) => {
                const div = document.createElement('div');
                div.className = 'thumbnail';
                div.style.setProperty('--i', i);

                const mainId = `main-image-${i}`;
                const tagsHTML = renderTags(project.tags);
                const allVisuals = [project.mainvisual, ...(project.extravisuals || [])];

                const isVideo = /\.(mp4|webm|ogg)$/i.test(project.mainvisual);
                const mainMediaHTML = isVideo
                    ? `<video id="${mainId}" src="${project.mainvisual}" autoplay loop muted playsinline controls class="main-image"></video>`
                    : `<img id="${mainId}" src="${project.mainvisual}" alt="Main Project Image" loading="lazy" class="main-image" />`;


                div.innerHTML = `
                    ${mainMediaHTML}
                    <h2 class="project-title">${project.title}</h2>
                    <div class="subtitle">${project.description}</div>
                    <div class="tags">${tagsHTML}</div>
                    <div class="project-actions">
                        <div class="project-links"></div>
                        <button class="open-project-btn button" data-id="${i}">Open Project</button>
                    </div>
                `;

                // Thumbnails as fragment
                const thumbsContainer = document.createElement('div');
                thumbsContainer.className = 'small-thumbnails';
                thumbsContainer.appendChild(generateThumbnails(
                    allVisuals,
                    mainId,
                    i,
                    replaceMainMedia
                ));
                const tagsEl = div.querySelector('.subtitle');
                tagsEl.appendChild(thumbsContainer);

                // Add links
                const linksContainer = div.querySelector('.project-links');
                if (Array.isArray(project.link)) {
                    project.link.forEach(url => {
                        linksContainer.appendChild(createProjectLink(url));
                    });
                }

                // Open modal on button click
                div.querySelector('.open-project-btn').onclick = () => openProject(i);
                container.appendChild(div);
            });
        });

    function replaceMainMedia(elementId, src) {
        const container = document.getElementById(elementId).parentNode;
        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
        const newMedia = isVideo
            ? Object.assign(document.createElement('video'), {
                src, autoplay: true, loop: true, muted: true, playsInline: true,
                controls: true, className: 'main-image', id: elementId
            })
            : Object.assign(document.createElement('img'), {
                src, alt: 'Main Project Image', className: 'main-image', id: elementId
            });

        const old = document.getElementById(elementId);
        container.replaceChild(newMedia, old);
    }

    function openProject(id) {
        const modal = document.getElementById('projectModal');
        const content = modal.querySelector('.modal-content');
        const project = window.loadedProjects[id];
        if (!project) return;

        const allVisuals = [project.mainvisual, ...(project.extravisuals || [])];

        // Clear and build modal content
        content.innerHTML = `
            <button class="close-modal button">close</button>
            <h2 class="project-title">${project.title}</h2>
            <p class="subtitle">${project.description}</p>
            <ul class="extra-info">
                <li><strong>Status:</strong> ${project.status || 'N/A'}</li>
                <li><strong>Role:</strong> ${project.role || 'N/A'}</li>
                <li><strong>Team Size:</strong> ${project.teamSize || 'N/A'}</li>
                <li><strong>Date:</strong> ${project.date || 'N/A'}</li>
                <li><strong>Duration:</strong> ${project.duration || 'N/A'}</li>
            </ul>
            <div class="tags">${renderTags(project.tags)}</div>
            <div class="project-links"></div>
        `;

        const isVideo = /\.(mp4|webm|ogg)$/i.test(project.mainvisual);
        const mainMediaEl = isVideo
            ? Object.assign(document.createElement('video'), {
                src: project.mainvisual, autoplay: true, loop: true, muted: true,
                playsInline: true, controls: true, className: 'main-image', id: 'modal-main-image'
            })
            : Object.assign(document.createElement('img'), {
                src: project.mainvisual, alt: project.title, className: 'main-image', id: 'modal-main-image'
            });
        content.appendChild(mainMediaEl);

        const smallThumbsContainer = document.createElement('div');
        smallThumbsContainer.className = 'small-thumbnails';
        smallThumbsContainer.appendChild(generateThumbnails(
            allVisuals,
            'modal-main-image',
            id,
            replaceModalMainMedia
        ));
        const tagsE2 = content.querySelector('.project-links');
        if (tagsE2) {
            tagsE2.insertAdjacentElement('afterend', smallThumbsContainer);
        }

        const linksContainer = content.querySelector('.project-links');
        if (Array.isArray(project.link)) {
            project.link.forEach(url => {
                linksContainer.appendChild(createProjectLink(url));
            });
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        content.querySelector('.close-modal').onclick = closeModal;
    }

    function replaceModalMainMedia(elementId, src) {
        const container = document.getElementById(elementId).parentNode;
        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
        const newMedia = isVideo
            ? Object.assign(document.createElement('video'), {
                src, autoplay: true, loop: true, muted: true, playsInline: true,
                controls: true, className: 'main-image', id: elementId
            })
            : Object.assign(document.createElement('img'), {
                src, alt: 'Main Project Image', className: 'main-image', id: elementId
            });
        const old = document.getElementById(elementId);
        container.replaceChild(newMedia, old);
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