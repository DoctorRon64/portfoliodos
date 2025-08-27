export async function loadLanguage(lang = 'en') {
    console.log(`loadLanguage called with lang: ${lang}`);
    console.log(`Current document.readyState: ${document.readyState}`);

    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            console.log('DOM is still loading, waiting...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
            console.log('DOM loaded, continuing...');
        }

        console.log('Starting to load home.json...');
        // Load home.json for main content
        const homeResponse = await fetch('/src/data/home.json');
        if (!homeResponse.ok) {
            throw new Error(`HTTP error! status: ${homeResponse.status}`);
        }

        const homeData = await homeResponse.json();
        console.log('Home data loaded:', homeData);
        const homeText = homeData[lang];

        if (!homeText) {
            console.warn(`Language "${lang}" not found in home.json. Falling back to English.`);
            return loadLanguage('en');
        }

        console.log('Home text for language:', homeText);

        // Update document title
        document.title = homeText.title;

        // Update page title element
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = homeText.title;

        // Navigation
        const navProjects = document.getElementById('nav-projects');
        const navAbout = document.getElementById('nav-about');
        const navContact = document.getElementById('nav-contact');
        const navLogo = document.getElementById('nav-logo');

        if (navProjects) navProjects.textContent = homeText.nav.projects;
        if (navAbout) navAbout.textContent = homeText.nav.about;
        if (navContact) navContact.textContent = homeText.nav.contact;
        if (navLogo) navLogo.textContent = homeText.nav.logo;

        // Home page specific content
        const headerTitle = document.getElementById('header-title');
        const headerSubtitle = document.getElementById('header-subtitle');
        const heroDescription = document.getElementById('hero-description');

        if (headerTitle) headerTitle.textContent = homeText.headerTitle;
        if (headerSubtitle) headerSubtitle.textContent = homeText.headerSubtitle;
        if (heroDescription) heroDescription.textContent = homeText.heroDescription;

        // About Section
        const aboutTitle = document.getElementById('about-title');
        const aboutDescription = document.getElementById('about-description');

        if (aboutTitle) aboutTitle.textContent = homeText.about.title;
        if (aboutDescription) aboutDescription.textContent = homeText.about.description;

        // Education Section
        if (homeText.about.education) {
            const educationTitle = document.getElementById('education-title');
            const educationInstitution = document.getElementById('education-institution');
            const educationDegree = document.getElementById('education-degree');
            const educationSpecialization = document.getElementById('education-specialization');

            if (educationTitle) educationTitle.textContent = homeText.about.education.title;
            if (educationInstitution) educationInstitution.textContent = homeText.about.education.institution;
            if (educationDegree) educationDegree.textContent = homeText.about.education.degree;
            if (educationSpecialization) educationSpecialization.textContent = homeText.about.education.specialization;
        }

        // Featured Section
        const featuredTitle = document.getElementById('featured-title');
        const featuredSubtitle = document.getElementById('featured-subtitle');
        const viewAllProjects = document.getElementById('view-all-projects');

        if (featuredTitle) featuredTitle.textContent = homeText.featured.title;
        if (featuredSubtitle) featuredSubtitle.textContent = homeText.featured.subtitle;
        if (viewAllProjects) viewAllProjects.textContent = homeText.featured.viewAll;

        // Hero Buttons
        const heroViewWork = document.getElementById('hero-view-work');
        const heroLearnMore = document.getElementById('hero-learn-more');

        if (heroViewWork) heroViewWork.textContent = homeText.hero.viewWork;
        if (heroLearnMore) heroLearnMore.textContent = homeText.hero.learnMore;

        // Contact CTA
        const ctaTitle = document.getElementById('cta-title');
        const ctaDescription = document.getElementById('cta-description');
        const ctaButton = document.getElementById('cta-button');

        if (ctaTitle) ctaTitle.textContent = homeText.contact.ctaTitle;
        if (ctaDescription) ctaDescription.textContent = homeText.contact.ctaDescription;
        if (ctaButton) ctaButton.textContent = homeText.contact.ctaButton;

        // Skills section
        const skillsTitle = document.getElementById('skills-title');
        if (skillsTitle && homeText.skills) {
            skillsTitle.textContent = homeText.skills.title;
        }

        // Load contact-specific content if on contact page
        const contactTitle = document.getElementById('contact-title');
        if (contactTitle) {
            try {
                const contactResponse = await fetch('/src/data/contact.json');
                if (contactResponse.ok) {
                    const contactData = await contactResponse.json();
                    const contactText = contactData[lang] || contactData['en'];

                    if (contactText) {
                        // Contact page title and subtitle
                        if (contactTitle) contactTitle.textContent = contactText.title;
                        const contactSubtitle = document.getElementById('contact-subtitle');
                        if (contactSubtitle) contactSubtitle.textContent = contactText.subtitle;

                        // Contact cards
                        const contactEmailTitle = document.getElementById('contact-email-title');
                        const contactEmail = document.getElementById('contact-email');
                        if (contactEmailTitle) contactEmailTitle.textContent = contactText.email.title;
                        if (contactEmail) contactEmail.textContent = contactText.email.value;

                        const contactGithubTitle = document.getElementById('contact-github-title');
                        const contactGithubLink = document.getElementById('contact-github-link');
                        if (contactGithubTitle) contactGithubTitle.textContent = contactText.github.title;
                        if (contactGithubLink) contactGithubLink.textContent = contactText.github.value;

                        const contactLinkedinTitle = document.getElementById('contact-linkedin-title');
                        const contactLinkedinLink = document.getElementById('contact-linkedin-link');
                        if (contactLinkedinTitle) contactLinkedinTitle.textContent = contactText.linkedin.title;
                        if (contactLinkedinLink) contactLinkedinLink.textContent = contactText.linkedin.value;

                        const contactSpotifyTitle = document.getElementById('contact-spotify-title');
                        const contactSpotifyLink = document.getElementById('contact-spotify-link');
                        if (contactSpotifyTitle) contactSpotifyTitle.textContent = contactText.spotify.title;
                        if (contactSpotifyLink) contactSpotifyLink.textContent = contactText.spotify.value;

                        // Update button texts
                        const contactActionBtns = document.querySelectorAll('.btn-text');
                        contactActionBtns.forEach(btn => {
                            if (btn.textContent === 'Loading...') {
                                btn.textContent = 'Open';
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load contact data:', error);
            }
        }

        // Load projects-specific content if on projects page
        const projectsTitle = document.getElementById('projects-title');
        if (projectsTitle) {
            try {
                const projectsResponse = await fetch('/src/data/projects.json');
                if (projectsResponse.ok) {
                    const projectsData = await projectsResponse.json();
                    const projectsText = projectsData[lang] || projectsData['en'];

                    if (projectsText && projectsText.length > 0) {
                        // Projects page title and subtitle
                        if (projectsTitle) projectsTitle.textContent = 'Portfolio';
                        const projectsSubtitle = document.getElementById('projects-subtitle');
                        if (projectsSubtitle) projectsSubtitle.textContent = 'Bekijk mijn projecten';
                    }
                }
            } catch (error) {
                console.error('Failed to load projects data:', error);
            }
        }

        window.labels = {
            date: homeText.labels?.date || 'Date',
            duration: homeText.labels?.duration || 'Duration',
            teamSize: homeText.labels?.teamSize || 'Team Size',
            role: homeText.labels?.role || 'Role',
            status: homeText.labels?.status || 'Status'
        };

        console.log(`Language "${lang}" loaded successfully`);

    } catch (error) {
        console.error('Failed to load language data:', error);
        // Fallback to English if there's an error
        if (lang !== 'en') {
            console.log('Attempting to fallback to English...');
            return loadLanguage('en');
        }
    }
}

