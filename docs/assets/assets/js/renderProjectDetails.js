import { tagsMap } from './tagsMap';

export function renderProjectDetails(project, containerId, isThumbnailPage) {
  const container = document.getElementById(containerId);
  const mainImageId = `main-image-${project.id}`;

  const projectDiv = document.createElement('div');
  projectDiv.className = 'thumbnail';

  const tagHTML = project.tags.map(tag => {
    const color = tagsMap[tag] || '#3b8ac4';
    return `<span class="tag" style="background-color: ${color}">${tag}</span>`;
  }).join('');

  let thumbnailsHTML = '';
  const visuals = [project.mainvisual, ...(project.extravisuals || [])];

  visuals.forEach((media, i) => {
    const isGif = media.toLowerCase().endsWith('.gif');
    const isVideo = /\.(mp4|webm|ogg)$/i.test(media);
    const thumbId = `thumb-${project.id}-${i}`;

    const wrapperHTML = `
      <div class="small-thumb-wrapper" data-title="${isVideo ? 'Video' : isGif ? 'GIF' : 'Image'}">
        <img class="small-thumb" id="${thumbId}" src="" onclick="updateMainImage('${mainImageId}', '${media}', ${isVideo})">
        <span class="${isGif ? 'gif-badge' : isVideo ? 'video-badge' : ''}">${isGif ? 'GIF' : isVideo ? 'VIDEO' : ''}</span>
      </div>
    `;
    thumbnailsHTML += wrapperHTML;

    setTimeout(() => {
      const target = document.getElementById(thumbId);
      if (!target) return;

      if (isGif) {
        renderGifPreview(media, target);
      } else if (isVideo) {
        const video = document.createElement('video');
        video.src = media;
        video.crossOrigin = "anonymous";
        video.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0);
          target.src = canvas.toDataURL("image/png");
        });
      } else {
        target.src = media;
      }
    }, 0);
  });

  // Main media: use image as default (will be replaced if video clicked)
  projectDiv.innerHTML = `
    <div class="project-title">${project.title}</div>
    <div class="subtitle">${project.description}</div>
    <img id="${mainImageId}" src="${project.mainvisual}" class="main-image" alt="Main Project Image">
    <div class="small-thumbnails">${thumbnailsHTML}</div>
    <div class="tags">${tagHTML}</div>
    <button onclick="openProject(${project.id})">Open Project</button>
  `;

  container.appendChild(projectDiv);

  if (!isThumbnailPage) {
    document.getElementById('project-title').innerText = project.title;
    document.getElementById('big-image').src = project.mainvisual;
    document.getElementById('project-description').innerText = project.description;

    const tagsContainer = document.getElementById('project-tags');
    project.tags.forEach(tag => {
      const span = document.createElement('span');
      span.innerText = tag;
      span.className = 'tag';
      span.style.backgroundColor = tagsMap[tag] || '#3b8ac4';
      tagsContainer.appendChild(span);
    });

    document.getElementById('project-date').innerText = project.date || 'N/A';
    document.getElementById('project-duration').innerText = project.duration || 'N/A';
    document.getElementById('project-role').innerText = project.role || 'N/A';
    document.getElementById('project-status').innerText = project.status || 'N/A';

    const linkContainer = document.getElementById('project-links');
    if (project.link && Array.isArray(project.link)) {
      project.link.forEach(url => {
        const a = document.createElement('a');
        a.href = url.startsWith('http') ? url : 'https://' + url;
        a.target = "_blank";
        a.innerText = url;
        linkContainer.appendChild(a);
        linkContainer.appendChild(document.createElement('br'));
      });
    }
  }
}

export function updateMainImage(imageId, mediaSrc, isVideo = false) {
  const container = document.getElementById(imageId).parentNode;
  const oldMedia = document.getElementById(imageId);
  let newMedia;

  if (isVideo) {
    newMedia.setAttribute('controls', '');
    newMedia.setAttribute('autoplay', '');
    newMedia.setAttribute('loop', '');
    newMedia.setAttribute('muted', ''); // Remove if you want audio
    newMedia.setAttribute('playsinline', '')
  } else {
    newMedia = document.createElement('img');
    newMedia.src = mediaSrc;
    newMedia.alt = 'Main Project Image';
    newMedia.className = 'main-image';
  }

  newMedia.id = imageId;
  container.replaceChild(newMedia, oldMedia);
}

export function renderGifPreview(gifUrl, targetImgEl) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = gifUrl;
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    targetImgEl.src = canvas.toDataURL("image/png");
  };
}
