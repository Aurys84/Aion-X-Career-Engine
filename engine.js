let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

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

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Iskola-Cég" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év" class="e-sub" oninput="updatePreview()">
        <input type="text" placeholder="Beosztás" class="e-desc" oninput="updatePreview()">
    `;
    container.appendChild(div);
    updatePreview();
}

// AZONNALI PREVIEW FRISSÍTÉS
async function updatePreview() {
    const d = dictionary[currentLang];
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);

    // Alapadatok (Itt nem várunk az API-ra, hogy azonnal lásd!)
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = n || "NÉV";
    document.getElementById('out-name').style.color = szin;

    const zip = document.getElementById('in-zip').value;
    const city = document.getElementById('in-city').value;
    const street = document.getElementById('in-street').value;
    const house = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${zip} ${city}, ${street} ${house}</div>
    `;

    // Szekciók - Ez már aszinkron, de folyamatosan frissít
    let mainHtml = "";
    const summaryText = document.getElementById('in-summary').value;
    if(summaryText) mainHtml += `<p><i>${await deepTranslate(summaryText)}</i></p>`;

    for (let type of ['edu', 'work']) {
        let itemsHtml = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = box.querySelector('.e-main').value;
            const s = box.querySelector('.e-sub').value;
            const desc = box.querySelector('.e-desc').value;
            if(m || desc) {
                const trM = await deepTranslate(m);
                const trD = await deepTranslate(desc);
                itemsHtml += `<div class="item-box"><b>${trM}</b><br><small>${s}</small><br><span style="color:${szin}">${trD}</span></div>`;
            }
        }
        if(itemsHtml) mainHtml += `<h3>${d[type]}</h3>` + itemsHtml;
    }

    const skills = document.getElementById('in-skills').value;
    if(skills) mainHtml += `<h3>${d.skills}</h3><div>${await deepTranslate(skills)}</div>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = updatePreview;
