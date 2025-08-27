export function initContact(lang = 'en') {
    // Load contact data
    fetch('../../data/contact.json')
        .then(res => res.json())
        .then(contactData => {
            const data = contactData[lang] || contactData['en'];
            updateContactContent(data);
        })
        .catch(err => {
            console.error('Failed to load contact data:', err);
        });

    // Load home data for navigation
    fetch('../../data/home.json')
        .then(res => res.json())
        .then(homeData => {
            const data = homeData[lang] || homeData['en'];
            updateNavigation(data);
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

function updateContactContent(data) {
    // Update header
    if (data.title) {
        const title = document.getElementById('contact-title');
        if (title) title.textContent = data.title;
    }

    if (data.subtitle) {
        const subtitle = document.getElementById('contact-subtitle');
        if (subtitle) subtitle.textContent = data.subtitle;
    }

    // Update email section
    if (data.email) {
        const emailTitle = document.getElementById('contact-email-title');
        if (emailTitle) emailTitle.textContent = data.email.title;

        const emailValue = document.getElementById('contact-email');
        if (emailValue) emailValue.textContent = data.email.value;

        const emailBtn = document.querySelector('.email-card .btn-text');
        if (emailBtn) emailBtn.textContent = data.email.btnText;
    }

    // Update GitHub section
    if (data.github) {
        const githubTitle = document.getElementById('contact-github-title');
        if (githubTitle) githubTitle.textContent = data.github.title;

        const githubLink = document.getElementById('contact-github-link');
        if (githubLink) {
            githubLink.textContent = data.github.value;
            githubLink.href = data.github.url;
        }

        const githubBtn = document.querySelector('.github-card .btn-text');
        if (githubBtn) githubBtn.textContent = data.github.btnText;
    }

    // Update LinkedIn section
    if (data.linkedin) {
        const linkedinTitle = document.getElementById('contact-linkedin-title');
        if (linkedinTitle) linkedinTitle.textContent = data.linkedin.title;

        const linkedinLink = document.getElementById('contact-linkedin-link');
        if (linkedinLink) {
            linkedinLink.textContent = data.linkedin.value;
            linkedinLink.href = data.linkedin.url;
        }

        const linkedinBtn = document.querySelector('.linkedin-card .btn-text');
        if (linkedinBtn) linkedinBtn.textContent = data.linkedin.btnText;
    }

    // Update Spotify section
    if (data.spotify) {
        const spotifyTitle = document.getElementById('contact-spotify-title');
        if (spotifyTitle) spotifyTitle.textContent = data.spotify.title;

        const spotifyLink = document.getElementById('contact-spotify-link');
        if (spotifyLink) {
            spotifyLink.textContent = data.spotify.value;
            spotifyLink.href = data.spotify.url;
        }

        const spotifyBtn = document.querySelector('.spotify-card .btn-text');
        if (spotifyBtn) spotifyBtn.textContent = data.spotify.btnText;
    }

    // Update Itch.io section
    if (data.itchio) {
        const itchioTitle = document.getElementById('contact-itchio-title');
        if (itchioTitle) itchioTitle.textContent = data.itchio.title;

        const itchioLink = document.getElementById('contact-itchio-link');
        if (itchioLink) {
            itchioLink.textContent = data.itchio.value;
            itchioLink.href = data.itchio.url;
        }

        const itchioBtn = document.querySelector('.itchio-card .btn-text');
        if (itchioBtn) itchioBtn.textContent = data.itchio.btnText;
    }
}


