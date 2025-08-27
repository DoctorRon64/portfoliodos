export class LanguageSwitcher {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            languages: [
                { code: 'en', flag: '🇬🇧', name: 'English' },
                { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
                { code: 'es', flag: '🇪🇸', name: 'Español' }
            ],
            currentLang: 'en',
            onLanguageChange: null,
            showNames: true,
            compact: false,
            ...options
        };

        this.init();
    }

    init() {
        this.currentLang = this.getCurrentLanguage();
        this.render();
        this.bindEvents();
    }

    getCurrentLanguage() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang') || 'en';
        
        // Validate language code
        const validLanguages = this.options.languages.map(l => l.code);
        return validLanguages.includes(lang) ? lang : 'en';
    }

    render() {
        this.container.innerHTML = '';

        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';

        if (this.options.compact) {
            switcher.classList.add('language-switcher--compact');
        }

        this.options.languages.forEach(lang => {
            const button = this.createLanguageButton(lang);
            if (lang.code === this.currentLang) {
                button.classList.add('active');
            }
            switcher.appendChild(button);
        });

        this.container.appendChild(switcher);
        
        // Ensure current language is set correctly
        this.currentLang = this.getCurrentLanguage();
    }

    createLanguageButton(lang) {
        const button = document.createElement('button');
        button.className = 'lang-btn';
        button.setAttribute('data-lang', lang.code);
        button.setAttribute('aria-label', `Switch to ${lang.name}`);

        if (this.options.showNames) {
            button.innerHTML = `
                <span class="lang-flag">${lang.flag}</span>
                <span class="lang-name">${lang.name}</span>
            `;
        } else {
            button.innerHTML = `<span class="lang-flag">${lang.flag}</span>`;
        }

        return button;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.lang-btn');
            if (button) {
                const lang = button.getAttribute('data-lang');
                if (lang) {
                    this.switchLanguage(lang);
                }
            }
        });
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;

        const previousLang = this.currentLang;

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);

        // Update current language
        this.currentLang = lang;

        // Update active state
        this.container.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Call callback if provided
        if (this.options.onLanguageChange) {
            this.options.onLanguageChange(lang);
        }

        // Dispatch custom event
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang, previousLanguage: previousLang }
        });
        window.dispatchEvent(event);
    }

    setLanguage(lang) {
        this.switchLanguage(lang);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

// Helper function to create a language switcher
export function createLanguageSwitcher(containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return null;
    }

    return new LanguageSwitcher(container, options);
}

