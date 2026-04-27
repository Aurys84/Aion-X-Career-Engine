let currentLang = 'hu';

// STÍLUS ÉS SZÍN GENERÁLÁS GOMBOKKAL
const colors = ["#007bb5", "#e67e22", "#27ae60", "#c0392b", "#8e44ad", "#1a1a1a", "#f1c40f", "#16a085", "#d35400", "#2c3e50"];
const themes = ["style-1", "style-2", "style-3", "style-4", "style-5", "style-6", "style-7", "style-8", "style-9", "style-10"];

function initButtons() {
    const cp = document.getElementById('color-picker');
    colors.forEach(c => {
        let b = document.createElement('div');
        b.className = 'color-btn';
        b.style.background = c;
        b.onclick = () => { document.documentElement.style.setProperty('--main-color', c); updatePreview(); };
        cp.appendChild(b);
    });
}

async function safeTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        const tr = data.responseData.translatedText;
        if (!tr || tr.includes("LIMIT") || tr.includes("WARNING")) return text;
        return tr;
    } catch (e) { return text; }
}

function updatePreview() {
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    // NÉV SORREND NYELV SZERINT
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    renderSync();
}

async function renderSync() {
    const d = dictionary[currentLang];
    
    // TÁJÉKOZTATÓK FRISSÍTÉSE
    document.getElementById('lbl-atsContent').innerText = d.atsTips;
    document.getElementById('lbl-guideText').innerText = d.guide;

    const phone = document.getElementById('in-phone').value;
    const email = document.getElementById('in-email').value;
    const city = await safeTranslate(document.getElementById('in-city').value);
    
    document.getElementById('out-contact').innerHTML = `
        ${phone ? '<div><b>' + d.phone + ':</b> ' + phone + '</div>' : ''}
        ${email ? '<div><b>' + d.email + ':</b> ' + email + '</div>' : ''}
        ${city ? '<div><b>' + d.addr + '</b> ' + city + '</div>' : ''}
    `;

    let html = "";
    const sumRaw = document.getElementById('in-summary').value;
    if(sumRaw) {
        const sum = await safeTranslate(sumRaw);
        html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    }

    // DINAMIKUS MEZŐK RENDERELÉSE
    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll(`#${type}-container .entry-box`);
        for (let box of boxes) {
            const main = box.querySelector('.e-main').value; // Tulajdonnév
            const sub = box.querySelector('.e-sub').value;   // Év
            
            // Ha adatbázisból választott
            const dbSelect = box.querySelector('.e-db-select');
            let dbVal = "";
            if(dbSelect && dbSelect.value !== "other") {
                const found = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs).find(x => x.hu === dbSelect.value);
                dbVal = found ? found[currentLang] : dbSelect.value;
            } else {
                // Csak akkor hívjuk az API-t, ha az "Egyéb" mezőbe írt
                dbVal = await safeTranslate(box.querySelector('.e-other').value);
            }

            if(main || dbVal) {
                items += `<div class="cv-item"><b>${main}</b> - ${dbVal} (${sub})</div>`;
            }
        }
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    document.getElementById('main-content').innerHTML = html;
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    
    let options = `<option value="other">-- EGYÉB (FORDÍTÓVAL) --</option>`;
    const source = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs);
    source.forEach(x => options += `<option value="${x.hu}">${x.hu}</option>`);

    div.innerHTML = `
        <input type="text" class="e-main" placeholder="${type==='edu'?'Iskola neve':'Cég neve'}" oninput="updatePreview()">
        <input type="text" class="e-sub" placeholder="Év (tól-ig)" oninput="updatePreview()">
        <select class="e-db-select" onchange="updatePreview()">${options}</select>
        <input type="text" class="e-other" placeholder="Ha nincs a listában, ide írd..." oninput="updatePreview()">
    `;
    container.appendChild(div);
}

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface();
    updatePreview();
}

window.onload = () => { initButtons(); updateInterface(); };
