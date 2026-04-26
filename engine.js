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

function updateInterface() {
    const d = dictionary[currentLang];
    const map = {
        'lbl-title': d.title, 'lbl-style': d.style, 'lbl-color': d.color, 'lbl-photo': d.photo,
        'lbl-lName': d.lName, 'lbl-fName': d.fName, 'lbl-cityHeader': d.cityHeader,
        'lbl-streetName': d.streetName, 'lbl-type': d.type, 'lbl-house': d.house,
        'lbl-phone': d.phone, 'lbl-email': d.email, 'lbl-summary': d.summary,
        'lbl-license': d.license, 'lbl-edu': d.edu, 'lbl-work': d.work, 'lbl-skills': d.skills,
        'lbl-addE': d.addE, 'lbl-addW': d.addW, 'lbl-atsTitle': d.atsTitle,
        'lbl-ats1': d.ats1, 'lbl-ats2': d.ats2, 'lbl-ats3': d.ats3, 'lbl-ats4': d.ats4
    };
    for (let id in map) { if (document.getElementById(id)) document.getElementById(id).innerText = map[id]; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    const vez = document.getElementById('in-lastName').value;
    const ker = document.getElementById('in-firstName').value;
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    
    document.getElementById('out-name').innerText = fullName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;
    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const city = await deepTranslate(document.getElementById('in-city').value);
    const sName = document.getElementById('in-street-name').value;
    const sTypeHU = document.getElementById('in-street-type').value;
    const sType = omniDict.find(e => e.hu === sTypeHU)[currentLang];
    const zip = document.getElementById('in-zip').value;
    const house = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.phone}:</b> ${document.getElementById('in-phone').value} | <b>${d.email}:</b> ${document.getElementById('in-email').value}<br>
            <b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+sName+' '+sType+' '+house+', '+zip : zip+' '+city+', '+sName+' '+sType+' '+house}
        </div>
    `;

    let html = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    
    for (let type of ['edu', 'work']) {
        let items = "";
        document.querySelectorAll('#' + type + '-container .entry-box').forEach(async box => {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const sub = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) items += `<div style="margin-bottom:12px"><b>${m}</b> (${sub})<br><span>${desc}</span></div>`;
        });
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
