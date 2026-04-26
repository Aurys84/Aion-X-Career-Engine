let currentLang = 'hu';

function changeLang(lang) {
    currentLang = lang;
    
    // Gombok stílusának frissítése
    document.querySelectorAll('.lang-btns button').forEach(btn => btn.classList.remove('active-lang'));
    document.getElementById('btn-' + lang).classList.add('active-lang');
    
    // Előlapi címkék fordítása a szótárból
    document.getElementById('lbl-name').innerText = dictionary[lang].name;
    // Itt frissítjük a placeholdereket is
    document.getElementById('in-name').placeholder = dictionary[lang].name + "...";
    
    updatePreview();
}

function updatePreview() {
    const name = document.getElementById('in-name').value;
    
    // Ha üres a mező, a szótárból veszi az alapértelmezett nevet
    document.getElementById('out-name').innerText = name || dictionary[currentLang].name;
}

// Alapértelmezett nyelv beállítása betöltéskor
window.onload = () => {
    changeLang('hu');
};
