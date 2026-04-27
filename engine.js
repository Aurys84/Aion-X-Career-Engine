let currentLang = 'hu';

async function apiTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        const tr = data.responseData.translatedText;
        return (tr && !tr.includes("LIMIT")) ? tr : text;
    } catch (e) { return text; }
}

function updateInterface() {
    const d = dictionary[currentLang];
    for (let key in d) {
        const el = document.getElementById('lbl-' + key);
        if (el) el.innerText = d[key];
    }
}

function updatePreview() {
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    // NÉVSORREND PAPÍRON: HU: Vez+Ker | EN/DE: Ker+Vez
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    renderPaper();
}

async function renderPaper() {
    const d = dictionary[currentLang];
    const city = await apiTranslate(document.getElementById('in-city').value);
    const sTypeSelect = document.getElementById('in-street-type');
    const sType = sTypeSelect.options[sTypeSelect.selectedIndex].text.split(' / ')[currentLang === 'hu' ? 0 : (currentLang === 'en' ? 1 : 2)];

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}:</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}:</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${city}, ${document.getElementById('in-street').value} ${sType} ${document.getElementById('in-house').value}</div>
    `;

    let html = "";
    const sum = document.getElementById('in-summary').value;
    if(sum) html += `<h3>${d.summary}</h3><p>${await apiTranslate(sum)}</p>`;

    // Dinamikus blokkok
    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll(`#${type}-container .entry-box`);
        for (let box of boxes) {
            const m = box.querySelector('.e-main').value;
            const sub = box.querySelector('.e-sub').value;
            const dbVal = box.querySelector('.e-db').value;
            const other = box.querySelector('.e-other').value;

            let title = "";
            if(dbVal !== "other") {
                const list = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs);
                const found = list.find(x => x.hu === dbVal);
                title = found ? found[currentLang] : dbVal;
            } else {
                title = await apiTranslate(other);
            }
            if(m || title) items += `<div style="margin-bottom:10px"><b>${m}</b> - ${title} (${sub})</div>`;
        }
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    document.getElementById('main-content').innerHTML = html;
}

function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    const list = (type === 'edu' ? careerDB.eduLevels : careerDB.jobs);
    let opts = list.map(x => `<option value="${x.hu}">${x.hu}</option>`).join('');
    
    div.innerHTML = `
        <input type="text" class="e-main" placeholder="${type==='edu'?'Iskola/Schule':'Cég/Firma'}">
        <input type="text" class="e-sub" placeholder="Év">
        <select class="e-db"><option value="other">-- EGYÉB / OTHER --</option>${opts}</select>
        <input type="text" class="e-other" placeholder="Ha nincs a listában, ide írd (API)...">
    `;
    document.getElementById(type + '-container').appendChild(div);
    div.querySelectorAll('input, select').forEach(el => el.oninput = updatePreview);
}

function setMode(l, b) {
    currentLang = l;
    document.querySelectorAll('.btn-lang').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    updateInterface(); updatePreview();
}

window.onload = () => {
    // 10 SZÍN GENERÁLÁSA
    const colors = ["#007bb5", "#e67e22", "#27ae60", "#c0392b", "#8e44ad", "#1a1a1a", "#f1c40f", "#16a085", "#d35400", "#2c3e50"];
    colors.forEach(c => {
        let b = document.createElement('div'); b.className = 'color-btn'; b.style.background = c;
        b.onclick = () => { document.documentElement.style.setProperty('--main-color', c); updatePreview(); };
        document.getElementById('color-picker').appendChild(b);
    });
    // 10 STÍLUS GENERÁLÁSA
    for(let i=1; i<=10; i++) {
        let b = document.createElement('button'); b.className = 'style-btn'; b.innerText = i;
        b.onclick = () => { document.body.className = 'style-' + i; updatePreview(); };
        document.getElementById('style-picker').appendChild(b);
    }
    updateInterface();
};

function loadPhoto(e) {
    const r = new FileReader();
    r.onload = () => { document.getElementById('out-photo').src = r.result; document.getElementById('out-photo-box').style.display='block'; };
    r.readAsDataURL(e.target.files[0]);
}
