let currentLang = 'hu';
let profilKepData = "";

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

// HIBRID FORDÍTÓ: Szótár + API kombináció
async function deepTranslate(text) {
    if (!text || currentLang === 'hu') return text;

    // 1. Ellenőrzés a belső szótárban (Gyorsabb)
    let found = omniDict.find(e => e.hu.toLowerCase() === text.toLowerCase());
    if (found) return found[currentLang];

    // 2. Ha nincs meg, irány az API (Plébános, stb.)
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) {
        console.log("API hiba, marad az eredeti.");
        return text;
    }
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Iskola/Cég" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év" class="e-sub" style="margin:5px 0" oninput="updatePreview()">
        <input type="text" placeholder="Beosztás/Szak" class="e-desc" oninput="updatePreview()">
    `;
    container.appendChild(div);
}

// ASZINKRON PREVIEW (Vár az API-ra, ha kell)
async function updatePreview() {
    const d = dictionary[currentLang];
    
    // Felület feliratok (A szótárból)
    ['name','zip','city','street','house','phone','email'].forEach(f => {
        if(document.getElementById('lbl-'+f)) document.getElementById('lbl-'+f).innerText = d[f];
    });

    // Kontakt adatok fordítása
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = (currentLang !== 'hu' && n.includes(" ")) ? n.split(" ").reverse().join(" ") : n || "NAME";

    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const house = document.getElementById('in-house').value;
    const zip = document.getElementById('in-zip').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${currentLang !== 'hu' ? zip+' '+city+', '+street+' '+house : city+', '+street+' '+house+', '+zip}</div>
    `;

    // Szekciók generálása
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
            if(m || desc) itemsHtml += `<div class="item-box"><b>${m}</b><br><small>${s}</small><br><span style="color:var(--main-color)">${desc}</span></div>`;
        }
        if(itemsHtml) mainHtml += `<h3>${d[type === 'edu' ? 'edu' : 'work']}</h3>` + itemsHtml;
    }

    // Készségek, Jogsi, Hobbi
    for (let k of ['skills', 'license', 'hobby']) {
        const val = await deepTranslate(document.getElementById('in-' + k).value);
        if(val) mainHtml += `<h3>${d[k]}</h3><div style="white-space:pre-wrap;">${val}</div>`;
    }

    document.getElementById('main-content').innerHTML = mainHtml;
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { document.documentElement.style.setProperty('--main-color', document.getElementById('theme-color').value); updatePreview(); }
function loadPhoto(e) { /* Képkezelés logikája marad */ }
