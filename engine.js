let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface(); // Ez most már frissíti a select opcióit is!
    updatePreview(); 
}

async function safeTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        const tr = data.responseData.translatedText;
        return (tr && !tr.includes("PLEASE SELECT")) ? tr : text;
    } catch (e) { return text; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;
    renderAsyncContent(szin);
}

async function renderAsyncContent(szin) {
    const d = dictionary[currentLang];
    const city = await safeTranslate(document.getElementById('in-city').value || "");
    const zip = document.getElementById('in-zip').value || "";
    const sName = document.getElementById('in-street-name').value || "";
    const house = document.getElementById('in-house').value || "";
    const phone = document.getElementById('in-phone').value || "";
    const email = document.getElementById('in-email').value || "";

    // TÍPUS LEKÉRÉSE A SZÓTÁRBÓL
    const sTypeHU = document.getElementById('in-street-type').value;
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
    const sumRaw = document.getElementById('in-summary').value;
    if(sumRaw) {
        const sum = await safeTranslate(sumRaw);
        html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    }

    // DINAMIKUS MEZŐK FIX
    for (let type of ['edu', 'work']) {
        let items = "";
        const boxes = document.querySelectorAll('#' + type + '-container .entry-box');
        for (let box of boxes) {
            const m = box.querySelector('.e-main').value;
            const sub = box.querySelector('.e-sub').value;
            const desc = box.querySelector('.e-desc').value;
            if(m || sub || desc) {
                items += `<div style="margin-bottom:12px"><b>${m}</b> ${sub ? '('+sub+')' : ''}<br><span>${desc}</span></div>`;
            }
        }
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
    
    // TÍPUSVÁLASZTÓ DINAMIKUS FELTÖLTÉSE
    const typeSelect = document.getElementById('in-street-type');
    const currentVal = typeSelect.value || "utca";
    typeSelect.innerHTML = "";
    omniDict.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.hu;
        opt.innerText = item[currentLang];
        if (item.hu === currentVal) opt.selected = true;
        typeSelect.appendChild(opt);
    });
}

function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="e-main" placeholder="Iskola/Cég" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()"><input type="text" class="e-desc" placeholder="Leírás" oninput="updatePreview()">`;
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
