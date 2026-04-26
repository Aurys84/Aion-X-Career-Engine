let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

async function deepTranslate(text) {
    if (!text) return "";
    // Ha a célnyelv magyar és magyarul írtad, ne hívjon API-t
    if (currentLang === 'hu') return text; 

    let found = omniDict.find(e => e.hu.toLowerCase() === text.trim().toLowerCase());
    if (found) return found[currentLang];

    try {
        // Automatikus felismerés (autodetect) -> Célnyelv
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('out-photo').src = reader.result;
        document.getElementById('out-photo-box').style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.style.background = "#1e1e1e";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.innerHTML = `
        <input type="text" placeholder="Iskola/Cég" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év" class="e-sub" oninput="updatePreview()">
        <input type="text" placeholder="Beosztás" class="e-desc" oninput="updatePreview()">
    `;
    container.appendChild(div);
}

function updatePreview() {
    const d = dictionary[currentLang];
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);

    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = n || "NAME";
    document.getElementById('out-name').style.color = szin;

    const zip = document.getElementById('in-zip').value;
    const ph = document.getElementById('in-phone').value;
    const em = document.getElementById('in-email').value;

    // Itt a fordított cím adatai jönnek majd a renderben
    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${ph}</div>
        <div><b>${d.email}</b> ${em}</div>
        <div id="out-addr-line"></div>
    `;
    
    renderMain(szin);
}

async function renderMain(szin) {
    const d = dictionary[currentLang];
    
    // Cím fordítása aszinkronban
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const house = document.getElementById('in-house').value;
    const zip = document.getElementById('in-zip').value;
    document.getElementById('out-addr-line').innerHTML = `<b>${d.addr}</b> ${currentLang !== 'hu' ? zip+' '+city+', '+street+' '+house : city+', '+street+' '+house+', '+zip}`;

    let mainHtml = "";

    // Bemutatkozás
    const sum = document.getElementById('in-summary').value;
    if(sum) mainHtml += `<h3>${d.summary}</h3><p><i>${await deepTranslate(sum)}</i></p>`;

    // Jogsi
    const lic = document.getElementById('in-license').value;
    if(lic) mainHtml += `<h3>${d.license}</h3><p>${await deepTranslate(lic)}</p>`;

    // Iskola és Munka
    for (let type of ['edu', 'work']) {
        let itemsHtml = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const s = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) itemsHtml += `<div style="margin-bottom:15px;"><b>${m}</b> (${s})<br><span style="color:${szin}">${desc}</span></div>`;
        }
        if(itemsHtml) mainHtml += `<h3>${d[type]}</h3>` + itemsHtml;
    }

    const sk = document.getElementById('in-skills').value;
    if(sk) mainHtml += `<h3>${d.skills}</h3><p>${await deepTranslate(sk)}</p>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = updatePreview;
