let currentLang = 'hu';

// 1. OKOS FELÜLET FRISSÍTÉSE (Hogy 3 nyelvű legyen a bal oldal)
function updateInterface() {
    // Ezek a címkék mindig 3 nyelven segítik Norbit
    const labels = {
        'lbl-name': 'Név / Name / Name',
        'lbl-phone': 'Tel / Phone / Telefon',
        'lbl-email': 'Email / Email / Email',
        'lbl-zip': 'Irsz / ZIP / PLZ',
        'lbl-city': 'Város / City / Stadt',
        'lbl-street': 'Utca / Street / Straße',
        'lbl-house': 'Házszám / No / Hausnr.',
        'lbl-edu-h': 'Tanulmányok / Education / Ausbildung',
        'lbl-work-h': 'Tapasztalat / Experience / Erfahrung',
        'lbl-summary': 'Bemutatkozás / Summary / Profil',
        'lbl-skills': 'Készségek / Skills / Kenntnisse',
        'lbl-license': 'Jogosítvány / License / Führerschein',
        'lbl-hobby': 'Hobbi / Hobbies / Hobby'
    };

    for (let id in labels) {
        const el = document.getElementById(id);
        if (el) el.innerText = labels[id];
    }
}

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Itt a titok: frissítjük a papírt a választott nyelvre
    updatePreview();
}

async function deepTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    // Belső szótár csekkolás (dictionary.js-ből)
    let found = omniDict.find(e => e.hu.toLowerCase() === text.toLowerCase());
    if (found) return found[currentLang];

    // API Fallback (Plébános és társai)
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Iskola-Cég / School-Company" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év / Year" class="e-sub" style="margin:5px 0" oninput="updatePreview()">
        <input type="text" placeholder="Beosztás / Role" class="e-desc" oninput="updatePreview()">
    `;
    container.appendChild(div);
    updatePreview();
}

async function updatePreview() {
    const d = dictionary[currentLang];
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);

    // Kapcsolat
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = (currentLang !== 'hu' && n.includes(" ")) ? n.split(" ").reverse().join(" ") : n || "NAME";
    document.getElementById('out-name').style.color = szin;

    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    
    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${document.getElementById('in-zip').value} ${city}, ${street} ${document.getElementById('in-house').value}</div>
    `;

    // Szekciók
    let mainHtml = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) mainHtml += `<p><i>${sum}</i></p>`;

    for (let type of ['edu', 'work']) {
        let itemsHtml = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const s = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) itemsHtml += `<div class="item-box"><b>${m}</b><br><small>${s}</small><br><span style="color:${szin}">${desc}</span></div>`;
        }
        if(itemsHtml) mainHtml += `<h3>${d[type]}</h3>` + itemsHtml;
    }

    // Skillek
    const sk = await deepTranslate(document.getElementById('in-skills').value);
    if(sk) mainHtml += `<h3>${d.skills}</h3><div style="white-space:pre-wrap;">${sk}</div>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }

// Betöltéskor 3 nyelvű felület beállítása
window.onload = () => { updateInterface(); updatePreview(); };
