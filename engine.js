let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface();
    updatePreview(); 
}

// EZ MOSTANTÓL NEM HÍV KÜLSŐ API-T, CSAK A BELSŐ SZÓTÁRT HASZNÁLJA
function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;
    renderStaticContent();
}

function renderStaticContent() {
    const d = dictionary[currentLang];
    
    const phone = document.getElementById('in-phone').value || "";
    const email = document.getElementById('in-email').value || "";
    const zip = document.getElementById('in-zip').value || "";
    const city = document.getElementById('in-city').value || "";
    const sName = document.getElementById('in-street-name').value || "";
    const house = document.getElementById('in-house').value || "";

    const sTypeSelect = document.getElementById('in-street-type');
    // A típusválasztó a szótárból szedi a nevet (utca/street/straße)
    const sTypeHU = sTypeSelect.value;
    const sTypeObj = omniDict.find(e => e.hu === sTypeHU);
    const sType = sTypeObj ? sTypeObj[currentLang] : sTypeHU;
    
    const fullStreet = sName ? sName + " " + sType : "";
    const addr = [zip, city, fullStreet, house].filter(x => x && x.trim() !== "").join(", ");

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px; line-height: 1.5;">
            ${phone ? '<div><b>' + d.phone + ':</b> ' + phone + '</div>' : ''}
            ${email ? '<div><b>' + d.email + ':</b> ' + email + '</div>' : ''}
            ${addr ? '<div style="margin-top:5px;"><b>' + d.addr + '</b> ' + addr + '</div>' : ''}
        </div>
    `;

    let html = "";
    const sum = document.getElementById('in-summary').value;
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;

    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        boxes.forEach(box => {
            const m = box.querySelector('.e-main').value;
            const sub = box.querySelector('.e-sub').value;
            const desc = box.querySelector('.e-desc').value;
            if(m || sub || desc) {
                items += `<div style="margin-bottom:12px"><b>${m}</b> ${sub ? '('+sub+')' : ''}<br><span>${desc}</span></div>`;
            }
        });
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    document.getElementById('main-content').innerHTML = html;
}

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
    div.innerHTML = `<input type="text" class="e-main" placeholder="Intézmény/Cég" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()"><input type="text" class="e-desc" placeholder="Leírás" oninput="updatePreview()">`;
    document.getElementById(type + '-container').appendChild(div);
}

function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = () => { document.getElementById('out-photo').src = reader.result; document.getElementById('out-photo-box').style.display = 'block'; };
    reader.readAsDataURL(event.target.files[0]);
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = () => { updateInterface(); updatePreview(); };
