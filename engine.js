// Aion-X Career Engine v1.1.0 - Core Logic
let currentLang = 'hu';

// Nyelvváltó funkció
function changeLang(lang) {
    currentLang = lang;
    
    // 1. Frissítjük a gombok kinézetét (melyik az aktív)
    document.querySelectorAll('.lang-btns button').forEach(btn => btn.classList.remove('active-lang'));
    document.getElementById('btn-' + lang).classList.add('active-lang');
    
    // 2. Lefordítjuk az előlap feliratait (Labels) a dictionary.js-ből
    document.getElementById('lbl-name').innerText = dictionary[lang].name;
    
    // 3. Frissítjük a beviteli mezők segédszövegeit (Placeholders)
    document.getElementById('in-name').placeholder = dictionary[lang].name + "...";
    
    // 4. Azonnal frissítjük a nézetet
    updatePreview();
}

// Élő nézet frissítése (Real-time Preview)
function updatePreview() {
    const nameValue = document.getElementById('in-name').value;
    
    // Megjelenítjük a nevet a papíron, vagy az alapértelmezettet, ha üres
    document.getElementById('out-name').innerText = nameValue || dictionary[currentLang].name;
}

// Amikor betölt az oldal, alapból a magyar nyelvet indítjuk
window.onload = () => {
    changeLang('hu');
};
