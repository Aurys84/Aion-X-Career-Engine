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
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
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
    
    // NÉV: Ha angol/német, megcseréli, ha magyar, visszaállítja
    const rawName = document.getElementById('in-name').value;
    let finalName = rawName;
    if (rawName.trim().includes(" ")) {
        let parts = rawName.split(" ");
        finalName = (currentLang !== 'hu') ? parts[1] + " " + parts[0] : parts[0] + " " + parts[1];
    }
    document.getElementById('out-name').innerText = finalName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsyncContent(szin);
}

async function renderAsyncContent(szin) {
    const d = dictionary[currentLang];
    const zip = document.getElementById('in-zip').value;
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const house = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+street+' '+house+', '+zip : zip+' '+city+', '+street+' '+house}
        </div>
    `;

    let html = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;

    // ... (Edu és Work ciklusok)
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
window.onload = () => { updateInterface(); updatePreview(); };
