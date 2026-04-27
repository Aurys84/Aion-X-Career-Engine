let currentLang = 'hu';

// STÍLUS ÉS SZÍN KONFIG
const colors = ["#007bb5", "#e67e22", "#27ae60", "#c0392b", "#8e44ad", "#1a1a1a", "#f1c40f", "#16a085", "#d35400", "#2c3e50"];
const themes = ["style-1", "style-2", "style-3", "style-4", "style-5", "style-6", "style-7", "style-8", "style-9", "style-10"];

function initGigaPanel() {
    const cp = document.getElementById('color-picker');
    colors.forEach(c => {
        let b = document.createElement('div'); b.className = 'color-btn'; b.style.background = c;
        b.onclick = () => { document.documentElement.style.setProperty('--main-color', c); updatePreview(); };
        cp.appendChild(b);
    });

    const sp = document.getElementById('style-picker');
    themes.forEach((t, index) => {
        let b = document.createElement('button'); b.className = 'style-btn'; b.innerText = index + 1;
        b.onclick = () => { document.body.className = t; updatePreview(); };
        sp.appendChild(b);
    });
}

async function apiTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        const tr = data.responseData.translatedText;
        return (tr && !tr.includes("LIMIT") && !tr.includes("WARNING")) ? tr : text;
    } catch (e) { return text; }
}

function updatePreview() {
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    // NÉV SORREND: HU (Vez+Ker) | EN/DE (Ker+Vez)
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    renderPaper();
}

async function renderPaper() {
    const d = dictionary[currentLang];
    
    // Tájékoztatók a Dictionary-ből
    document.getElementById('lbl-atsContent').innerText = d.atsContent;
    document.getElementById('lbl-guideText').innerText = d.guideText;

    const city = await apiTranslate(document.getElementById('in-city').value);
    const sName = document.getElementById('in-street-name')?.value || ""; 
    // ... contact adatok renderelése
    
    let html = "";
    const sumRaw = document.getElementById('in-summary').value;
    if(sumRaw) {
        const sum = await apiTranslate(sumRaw); // PROFILRA MINDIG API
        html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    }

    // DINAMIKUS MEZŐK CIKLUSA (DB VAGY API)
    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll(`#${type}-container .entry-box`);
        for (let box of boxes) {
            const mainName = box.querySelector('.e-main').value; // Iskola/Cég (NEM FORDÍTJUK)
            const dates = box.querySelector('.e-sub').value;     // Év
            
            const dbSel = box.querySelector('.e-db-select').value;
            const other = box.querySelector('.e-other').value;
            
            let finalTitle = "";
            if(dbSel !== "other") {
                const list = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs);
                const found = list.find(x => x.hu === dbSel);
                finalTitle = found ? found[currentLang] : dbSel;
            } else {
                finalTitle = await apiTranslate(other); // CSAK HA EGYÉB, AKKOR API
            }

            if(mainName || finalTitle) {
                items += `<div class="cv-item"><b>${mainName}</b> | ${finalTitle} <small>${dates}</small></div>`;
            }
        }
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    document.getElementById('main-content').innerHTML = html;
}

function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    const list = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs);
    let opts = `<option value="other">-- EGYÉB (FORDÍTÓVAL) --</option>`;
    list.forEach(x => opts += `<option value="${x.hu}">${x.hu}</option>`);

    div.innerHTML = `
        <input type="text" class="e-main" placeholder="${type==='edu'?'Iskola neve':'Cég neve'}" oninput="updatePreview()">
        <input type="text" class="e-sub" placeholder="Év (tól-ig)" oninput="updatePreview()">
        <select class="e-db-select" onchange="updatePreview()">${opts}</select>
        <input type="text" class="e-other" placeholder="Ha nincs a listában, írd ide..." oninput="updatePreview()">
    `;
    document.getElementById(type + '-container').appendChild(div);
}

function setMode(l, b) {
    currentLang = l;
    document.querySelectorAll('.btn-lang').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    updateInterface(); updatePreview();
}

window.onload = () => { initGigaPanel(); updateInterface(); };
