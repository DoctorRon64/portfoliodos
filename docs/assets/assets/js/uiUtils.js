import { tagsMap } from './tagsMap.js';

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

        const gifBadge = document.createElement("span");
        gifBadge.className = "gif-badge";
        gifBadge.textContent = "GIF";
        targetImgEl.parentElement.style.position = "relative";
        targetImgEl.parentElement.appendChild(gifBadge);
    };
}

export function renderTags(tags) {
    return tags.map(tag => {
        const color = tagsMap[tag] || '#3b8ac4';
        const style = color.startsWith('linear-gradient')
            ? `background-image: ${color}`
            : `background-color: ${color}`;
        return `<span class="tag" style="${style}">${tag}</span>`;
    }).join('');
}

// uiUtils.js
export function generateThumbnails(images, mainImageId, index, clickHandlerTemplate) {
  return images.map((img, i) => {
    const isGif = img.toLowerCase().endsWith('.gif');
    const isVideo = /\.(mp4|webm|ogg)$/i.test(img);
    const thumbId = `thumb-${index}-${i}`;
    let badgeHTML = '';

    if (isGif) badgeHTML = '<span class="gif-badge">GIF</span>';
    if (isVideo) badgeHTML = '<span class="play-badge">▶</span>';

    const clickHandler = clickHandlerTemplate.replace('{img}', img);

    let thumbnailHTML = `
      <div class="small-thumb-wrapper" data-title="${isVideo ? 'Video' : isGif ? 'GIF' : 'Image'}">
        <img class="small-thumb" id="${thumbId}" src="${isVideo ? '' : img}" onclick="${clickHandler}">
        ${badgeHTML}
      </div>
    `;

    // Lazy render previews for videos and GIFs
    setTimeout(() => {
      const el = document.getElementById(thumbId);
      if (isGif && el) {
        renderGifPreview(img, el);
      } else if (isVideo && el) {
        const video = document.createElement('video');
        video.src = img;
        video.crossOrigin = "anonymous";
        video.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          el.src = canvas.toDataURL("image/png");
        });
      }
    }, 0);

    return thumbnailHTML;
  }).join('');
}

export function createProjectLink(url) {
  const a = document.createElement('a');
  a.href = url.startsWith('http') ? url : 'https://' + url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  const urlLower = url.toLowerCase();

  if (urlLower.includes('github')) {
    a.className = 'btn btn-github';
    a.title = urlLower.includes('release') ? "GitHub Build" : "GitHub Source";
    a.innerHTML = `<img src="/assets/img/icons/tabler/tabler--brand-github.svg" alt="GitHub icon" class="icon" /> ${a.title.split(' ')[1]}`;

  } else if (urlLower.includes('itch.io') || urlLower.includes('itchio')) {
    a.className = 'btn btn-itchio';
    a.title = "itch.io Build";
    a.innerHTML = `<img src="/assets/img/icons/tabler/tabler--brand-itch.svg" alt="itch.io icon" class="icon" /> Build`;

  } else {
    a.textContent = url;
    a.title = url;
  }

  return a;
}
