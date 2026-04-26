let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface();
    updatePreview(); 
}

async function deepTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV LOGIKA: Nem fordítjuk le az API-val, csak a sorrendet cseréljük!
    const rawName = document.getElementById('in-name').value;
    let finalName = rawName;
    if (rawName.trim().includes(" ")) {
        let parts = rawName.split(" ");
        // Ha nem HU, és még az eredeti sorrendben van, megfordítjuk
        finalName = (currentLang !== 'hu') ? parts[1] + " " + parts[0] : parts[0] + " " + parts[1];
    }
    document.getElementById('out-name').innerText = finalName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const zip = document.getElementById('in-zip').value;
    const city = await deepTranslate(document.getElementById('in-city').value);
    
    // UTCA VÉDŐ LOGIKA: Az utca nevét (pl. Petőfi) nem fordítjuk, csak az "utca" szót
    const streetName = document.getElementById('in-street').value;
    const streetLabel = omniDict.find(e => e.hu === "utca")[currentLang];
    const fullStreet = streetName + " " + streetLabel;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.phone}</b> ${document.getElementById('in-phone').value} | <b>${d.email}</b> ${document.getElementById('in-email').value}<br>
            <b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+fullStreet+' '+document.getElementById('in-house').value+', '+zip : zip+' '+city+', '+fullStreet+' '+document.getElementById('in-house').value}
        </div>
    `;

    // TARTALOM FORDÍTÁS (Summary, Work, Edu)
    let html = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    // ... ciklusok ...
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
    div.innerHTML = `<input type="text" class="e-main" placeholder="Cég/Iskola" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()">`;
    document.getElementById(type + '-container').appendChild(div);
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
function updateInterface() {
    const d = dictionary[currentLang];
    for (let key in d) {
        const el = document.getElementById('lbl-' + key);
        if (el) el.innerText = d[key];
    }
}
window.onload = () => { updateInterface(); updatePreview(); };
