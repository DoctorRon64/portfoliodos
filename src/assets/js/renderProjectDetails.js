// renderProjectDetails.js

export function renderProjectDetails(project, containerId, isThumbnailPage) {
  const container = document.getElementById(containerId);
  const mainImageId = `main-image-${project.id}`;

  // Create the project container
  const projectDiv = document.createElement('div');
  projectDiv.className = 'thumbnail';

  // Render tags
  const tagHTML = project.tags.map(tag => {
    const color = tagsMap[tag] || '#3b8ac4';
    return `<span class="tag" style="background-color: ${color}">${tag}</span>`;
  }).join('');

  // Create the thumbnails HTML
  let thumbnailsHTML = '';
  [project.mainvisual, ...(project.extravisuals || [])].forEach((img, i) => {
    const isGif = img.toLowerCase().endsWith('.gif');
    const thumbId = `thumb-${project.id}-${i}`;

    // Generate thumbnail HTML
    thumbnailsHTML += `
      <img class="small" id="${thumbId}" src="${img}" onclick="updateMainImage('${mainImageId}', '${img}')">
    `;

    // If it's a GIF, render the first frame preview
    if (isGif) {
      setTimeout(() => {
        const targetEl = document.getElementById(thumbId);
        if (targetEl) {
          renderGifPreview(img, targetEl);
        }
      }, 0);
    }
  });

  // Set up the project HTML content
  projectDiv.innerHTML = `
    <div class="project-title">${project.title}</div>
    <div class="subtitle">${project.description}</div>
    <img id="${mainImageId}" src="${project.mainvisual}" alt="Main Project Image">
    <div class="small-thumbnails">${thumbnailsHTML}</div>
    <div class="tags">${tagHTML}</div>
    <button onclick="openProject(${project.id})">Open Project</button>
  `;

  // Append to container
  container.appendChild(projectDiv);

  // If on the "cell.html" page, set up the detailed page view
  if (!isThumbnailPage) {
    document.getElementById('project-title').innerText = project.title;
    document.getElementById('big-image').src = project.mainvisual;
    document.getElementById('project-description').innerText = project.description;

    const tagsContainer = document.getElementById('project-tags');
    project.tags.forEach(tag => {
      const span = document.createElement('span');
      span.innerText = tag;
      span.className = 'tag'; // Apply the tag styles from CSS
      span.style.backgroundColor = tagsMap[tag] || '#3b8ac4'; // Dynamically set the color
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

export function updateMainImage(imageId, imgSrc) {
  document.getElementById(imageId).src = imgSrc;
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
