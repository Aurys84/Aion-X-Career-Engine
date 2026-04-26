let currentLang = 'hu';
let profilKepData = "";

// 1. FELÜLET INDÍTÁSA
window.onload = () => {
    updateInterface();
    updatePreview();
};

// 2. NYELV VÁLTÁSA ÉS SZEINKRONIZÁLÁS
function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

// 3. HIBRID FORDÍTÓ (Szótár + MyMemory API)
async function deepTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    let found = omniDict.find(e => e.hu.toLowerCase() === text.trim().toLowerCase());
    if (found) return found[currentLang];

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

// 4. KÉPKEZELÉS (A&N Vizuál)
function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        profilKepData = reader.result;
        const out = document.getElementById('out-photo');
        const box = document.getElementById('out-photo-box');
        const preview = document.getElementById('photo-p');
        
        if(out) out.src = reader.result;
        if(box) box.style.display = 'block';
        if(preview) preview.innerHTML = `<img src="${reader.result}" style="width:100%; height:100%; object-fit:cover;">`;
        updatePreview();
    };
    reader.readAsDataURL(event.target.files[0]);
}

// 5. DINAMIKUS MEZŐK HOZZÁADÁSA (Iskola/Munka)
function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Intézmény-Cég" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év / Időtartam" class="e-sub" style="margin:5px 0" oninput="updatePreview()">
        <input type="text" placeholder="Pozíció / Szak" class="e-desc" oninput="updatePreview()">
    `;
    container.appendChild(div);
}

// 6. A MASTER PREVIEW (Itt történik a varázslat)
async function updatePreview() {
    const d = dictionary[currentLang];
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);

    // Alapadatok
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = (currentLang !== 'hu' && n.includes(" ")) ? n.split(" ").reverse().join(" ") : n || "NÉV";
    document.getElementById('out-name').style.color = szin;

    const zip = document.getElementById('in-zip').value;
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${currentLang !== 'hu' ? zip+' '+city+', '+street : city+', '+street+', '+zip}</div>
    `;

    let mainHtml = "";

    // Jogosítvány (ATS prioritás)
    const lic = document.getElementById('in-license').value;
    if(lic) {
        const trLic = await deepTranslate(lic);
        mainHtml += `<h3>${d.license}</h3><p>${trLic}</p>`;
    }

    // Dinamikus blokkok (Edu, Work)
    for (let type of ['edu', 'work']) {
        let itemsHtml = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const s = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) {
                itemsHtml += `<div class="item-box"><b>${m}</b><br><small>${s}</small><br><span style="color:${szin}">${desc}</span></div>`;
            }
        }
        if(itemsHtml) mainHtml += `<h3>${d[type]}</h3>` + itemsHtml;
    }

    // Készségek
    const skills = await deepTranslate(document.getElementById('in-skills').value);
    if(skills) mainHtml += `<h3>${dictionary[currentLang].skills}</h3><div style="white-space:pre-wrap;">${skills}</div>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

// 7. STÍLUS ÉS SZÍN VEZÉRLÉS
function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }

function updateInterface() {
    // Itt tarthatod a 3 nyelvű felület frissítését, ha a HTML-ben nem fixáltuk
}
