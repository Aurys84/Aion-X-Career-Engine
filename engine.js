let currentLang = 'hu';

function changeLang(lang) {
    currentLang = lang;
    
    // Gombok stílusának frissítése
    document.querySelectorAll('.lang-btns button').forEach(btn => btn.classList.remove('active-lang'));
    const activeBtn = document.getElementById('btn-' + lang);
    if(activeBtn) activeBtn.classList.add('active-lang');
    
    // Előlapi címkék fordítása (HU/EN/DE)
    document.getElementById('lbl-name').innerText = dictionary[lang].name;
    document.getElementById('lbl-summary').innerText = dictionary[lang].summary;
    
    // Placeholderek frissítése
    document.getElementById('in-name').placeholder = dictionary[lang].name + "...";
    document.getElementById('in-summary').placeholder = dictionary[lang].placeholder;
    
    updatePreview();
}

function updatePreview() {
    const name = document.getElementById('in-name').value;
    const summary = document.getElementById('in-summary').value;
    
    // Preview frissítése
    document.getElementById('out-name').innerText = name || dictionary[currentLang].name;
    document.getElementById('out-summary').innerText = summary || dictionary[currentLang].placeholder;
}

// Amikor betölt az oldal, azonnal a magyar nyelvet indítjuk
window.onload = () => {
    if (typeof dictionary !== 'undefined') {
        changeLang('hu');
    } else {
        console.error("Hiba: A dictionary.js nem töltődött be!");
    }
};
