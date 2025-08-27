# Language Switcher Component

Een herbruikbare language switcher component die op alle pagina's gebruikt kan worden.

## Gebruik

### Basis Gebruik

```html
<!-- HTML -->
<div id="language-switcher-container"></div>

<script type="module">
import { createLanguageSwitcher } from '../assets/js/languageSwitcher.js';

const languageSwitcher = createLanguageSwitcher('#language-switcher-container');
</script>
```

### Met Callback

```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    onLanguageChange: (newLang) => {
        // Herlaad pagina content in nieuwe taal
        loadLanguage(newLang);
        updatePageContent(newLang);
    }
});
```

### Compacte Variant

```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    compact: true, // Alleen vlaggen, geen namen
    showNames: false
});
```

### Floating Variant

```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    floating: true // Vaste positie rechtsboven
});
```

## Opties

| Optie | Type | Default | Beschrijving |
|-------|------|---------|--------------|
| `languages` | Array | EN, NL, ES | Beschikbare talen |
| `currentLang` | String | 'en' | Huidige taal |
| `onLanguageChange` | Function | null | Callback bij taalwissel |
| `showNames` | Boolean | true | Toon taalnamen |
| `compact` | Boolean | false | Compacte weergave |
| `floating` | Boolean | false | Vaste positie |

## Events

De component dispatcht een `languageChanged` event:

```javascript
window.addEventListener('languageChanged', (event) => {
    const { language, previousLanguage } = event.detail;
    console.log(`Taal gewijzigd van ${previousLanguage} naar ${language}`);
});
```

## Methoden

```javascript
// Taal instellen
languageSwitcher.setLanguage('nl');

// Huidige taal ophalen
const currentLang = languageSwitcher.getCurrentLanguage();

// Component vernietigen
languageSwitcher.destroy();
```

## Voorbeelden per Pagina

### Home Page
```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    onLanguageChange: (newLang) => {
        loadLanguage(newLang);
        updateHomeContent(newLang);
    }
});
```

### Projects Page
```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    onLanguageChange: (newLang) => {
        loadLanguage(newLang);
        updateProjectsContent(newLang);
    }
});
```

### Contact Page
```javascript
const languageSwitcher = createLanguageSwitcher('#language-switcher-container', {
    onLanguageChange: (newLang) => {
        loadLanguage(newLang);
        initContact(newLang);
    }
});
```

## Styling

De component heeft verschillende CSS classes:
- `.language-switcher` - Basis styling
- `.language-switcher--compact` - Compacte variant
- `.language-switcher--floating` - Vaste positie variant
- `.lang-btn` - Individuele taal knoppen
- `.lang-btn.active` - Actieve taal
- `.lang-flag` - Vlag emoji
- `.lang-name` - Taalnaam

