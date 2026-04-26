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

function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('out-photo').src = reader.result;
        document.getElementById('out-photo-box').style.display = 'block';
        updatePreview();
    };
    reader.readAsDataURL(event.target.files[0]);
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Cég/Iskola" class="e-main" oninput="updatePreview()" style="width:100%; margin-bottom:5px;">
        <input type="text" placeholder="Év" class="e-sub" oninput="updatePreview()" style="width:100%; margin-bottom:5px;">
        <input type="text" placeholder="Pozíció" class="e-desc" oninput="updatePreview()" style="width:100%;">
    `;
    container.appendChild(div);
}

function updatePreview() {
    const d = dictionary[currentLang];
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);

    // Azonnali adatok
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = n || "NÉV / NAME";
    document.getElementById('out-name').style.color = szin;

    const zip = document.getElementById('in-zip').value;
    const city = document.getElementById('in-city').value;
    const street = document.getElementById('in-street').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${zip} ${city} ${street}</div>
    `;
    
    renderMain(szin);
}

async function renderMain(szin) {
    const d = dictionary[currentLang];
    let mainHtml = "";

    const lic = document.getElementById('in-license').value;
    if(lic) mainHtml += `<h3>${d.license}</h3><p>${await deepTranslate(lic)}</p>`;

    for (let type of ['edu', 'work']) {
        let itemsHtml = "";
        document.querySelectorAll('#' + type + '-container .entry-box').forEach(async box => {
            const m = box.querySelector('.e-main').value;
            const s = box.querySelector('.e-sub').value;
            const desc = box.querySelector('.e-desc').value;
            if(m || desc) {
                itemsHtml += `<div><b>${await deepTranslate(m)}</b> (${s})<br><span style="color:${szin}">${await deepTranslate(desc)}</span></div>`;
            }
        });
        if(itemsHtml) mainHtml += `<h3>${d[type]}</h3>` + itemsHtml;
    }

    const sk = document.getElementById('in-skills').value;
    if(sk) mainHtml += `<h3>${d.skills}</h3><p>${await deepTranslate(sk)}</p>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = updatePreview;
