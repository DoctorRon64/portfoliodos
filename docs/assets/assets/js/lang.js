export async function loadLanguage(lang = 'en') {
    try {
        const response = await fetch('../data/home.json');
        const data = await response.json();

        const text = data[lang];
        if (!text) {
            console.warn(`Language "${lang}" not found in home.json. Falling back to English.`);
            return loadLanguage('en');
        }

        // Update document title
        document.title = text.title;

        // Navigation
        document.getElementById('nav-projects').textContent = text.nav.projects;
        document.getElementById('nav-about').textContent = text.nav.about;
        document.getElementById('nav-contact').textContent = text.nav.contact;
        document.getElementById('nav-logo').textContent = text.nav.logo;

        // Header
        document.getElementById('header-title').textContent = text.headerTitle;
        document.getElementById('header-subtitle').textContent = text.headerSubtitle;

        // About Section
        document.getElementById('about-title').textContent = text.about.title;
        document.getElementById('about-description').textContent = text.about.description;

        // You can extend this to modal content, project tags, etc.
    } catch (error) {
        console.error('Failed to load language data:', error);
    }
}