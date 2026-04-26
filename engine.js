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
    
    // NÉV ÖSSZERAKÁSA NYELV SZERINT
    const vez = document.getElementById('in-lastName').value;
    const ker = document.getElementById('in-firstName').value;
    let fullName = "";
    if (vez || ker) {
        fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    }
    document.getElementById('out-name').innerText = fullName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const city = await deepTranslate(document.getElementById('in-city').value);
    
    // UTCA TÍPUS FORDÍTÁSA A SZÓTÁRBÓL
    const sName = document.getElementById('in-street-name').value;
    const sTypeHU = document.getElementById('in-street-type').value;
    const sTypeTranslated = omniDict.find(e => e.hu === sTypeHU)[currentLang];
    const fullStreet = sName + " " + sTypeTranslated;
    
    const zip = document.getElementById('in-zip').value;
    const house = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.phone}</b> ${document.getElementById('in-phone').value} | <b>${d.email}</b> ${document.getElementById('in-email').value}<br>
            <b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+fullStreet+' '+house+', '+zip : zip+' '+city+', '+fullStreet+' '+house}
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

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
function updateInterface() {
    const d = dictionary[currentLang];
    for (let key in d) {
        const el = document.getElementById('lbl-' + key);
        if (el) el.innerText = d[key];
    }
}
function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="e-main" placeholder="Cég/Iskola" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()"><input type="text" class="e-desc" placeholder="Részletek" oninput="updatePreview()">`;
    document.getElementById(type + '-container').appendChild(div);
}
function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = () => { document.getElementById('out-photo').src = reader.result; document.getElementById('out-photo-box').style.display = 'block'; };
    reader.readAsDataURL(event.target.files[0]);
}
window.onload = () => { updateInterface(); updatePreview(); };
