let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface();
    updatePreview(); 
}

async function deepTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV LOGIKA: Tűpontos sorrendvezérlés
    const vez = document.getElementById('in-lastName').value;
    const ker = document.getElementById('in-firstName').value;
    
    let fullName = "";
    if (vez || ker) {
        // Ha magyar, akkor Vezetéknév + Keresztnév, különben fordítva
        fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    }
    
    document.getElementById('out-name').innerText = fullName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

// Az updateInterface() függvényben ellenőrizzük a label-eket
function updateInterface() {
    const d = dictionary[currentLang];
    const labels = {
        'lbl-lName': d.lName,
        'lbl-fName': d.fName,
        'lbl-streetName': d.streetName,
        'lbl-type': "≡ " + d.type, // Itt adjuk hozzá az ikont programozottan
        'lbl-house': d.house,
        'lbl-cityHeader': d.cityHeader,
        'lbl-atsTitle': d.atsTitle,
        'lbl-ats1': d.ats1,
        'lbl-ats2': d.ats2,
        'lbl-ats3': d.ats3,
        'lbl-ats4': d.ats4
    };

    for (let id in labels) {
        const el = document.getElementById(id);
        if (el) el.innerText = labels[id];
    }
    
    // A többi label (Stílus, Szín, Telefon, stb.) frissítése...
    const basicLabels = ['style', 'color', 'photo', 'phone', 'email', 'summary', 'license', 'edu', 'work', 'skills'];
    basicLabels.forEach(key => {
        const el = document.getElementById('lbl-' + key);
        if (el) el.innerText = d[key];
    });
}
function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="e-main" placeholder="Cég/Iskola" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()"><input type="text" class="e-desc" placeholder="Részletek" oninput="updatePreview()">`;
    document.getElementById(type + '-container').appendChild(div);
}
function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = () => { document.getElementById('out-photo').src = reader.result; document.getElementById('out-photo-box').style.display = 'block'; };
    reader.readAsDataURL(event.target.files[0]);
}
window.onload = () => { updateInterface(); updatePreview(); };
