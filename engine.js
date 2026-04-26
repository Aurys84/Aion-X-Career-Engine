
let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface();
    updatePreview(); 
}

async function deepTranslate(text) {
    if (!text) return "";
    // Magyar nyelven nem kérünk fordítást, csak visszaadjuk a szöveget
    if (currentLang === 'hu') return text;
    try {
        // Fixált API hívás autodetect funkcióval
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        const trText = data.responseData.translatedText;
        // Ha hibás a válasz (pl. a hibaüzenet), adjuk vissza az eredetit
        if (trText.includes("PLEASE SELECT")) return text;
        return trText || text;
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
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // Név sorrend fix
    const rawName = document.getElementById('in-name').value;
    let finalName = rawName;
    if (rawName.trim().includes(" ")) {
        let parts = rawName.split(" ");
        finalName = (currentLang !== 'hu') ? parts[1] + " " + parts[0] : parts[0] + " " + parts[1];
    }
    document.getElementById('out-name').innerText = finalName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const zip = document.getElementById('in-zip').value;
    const cityRaw = document.getElementById('in-city').value;
    const streetRaw = document.getElementById('in-street').value;
    const house = document.getElementById('in-house').value;

    const city = await deepTranslate(cityRaw);
    const street = await deepTranslate(streetRaw);

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px; line-height: 1.6;">
            <b>${d.phone}</b> ${document.getElementById('in-phone').value}<br>
            <b>${d.email}</b> ${document.getElementById('in-email').value}<br>
            <b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+street+' '+house+', '+zip : zip+' '+city+', '+street+' '+house}
        </div>
    `;

    let html = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    const lic = await deepTranslate(document.getElementById('in-license').value);
    if(lic) html += `<h3>${d.license}</h3><p>${lic}</p>`;

    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const sub = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) items += `<div style="margin-bottom:12px"><b>${m}</b> (${sub})<br><span style="color:${szin}">${desc}</span></div>`;
        }
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    document.getElementById('main-content').innerHTML = html;
}

function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = () => { document.getElementById('out-photo').src = reader.result; document.getElementById('out-photo-box').style.display = 'block'; };
    reader.readAsDataURL(event.target.files[0]);
}

function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="e-main" placeholder="Cég/Iskola" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()"><input type="text" class="e-desc" placeholder="Részletek" oninput="updatePreview()">`;
    document.getElementById(type + '-container').appendChild(div);
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = () => { updateInterface(); updatePreview(); };
