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
    let found = omniDict.find(e => e.hu.toLowerCase() === text.trim().toLowerCase());
    if (found) return found[currentLang];
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
function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" placeholder="Iskola/Cég" class="e-main" oninput="updatePreview()"><input type="text" placeholder="Év" class="e-sub" oninput="updatePreview()"><input type="text" placeholder="Pozíció" class="e-desc" oninput="updatePreview()">`;
    container.appendChild(div);
}
function loadPhoto(event) {
    const reader = new FileReader();
    reader.onload = () => { document.getElementById('out-photo').src = reader.result; document.getElementById('out-photo-box').style.display = 'block'; };
    reader.readAsDataURL(event.target.files[0]);
}
function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    document.getElementById('out-name').innerText = document.getElementById('in-name').value || "NAME";
    document.getElementById('out-name').style.color = szin;
    renderAsync(szin);
}
async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const c = await deepTranslate(document.getElementById('in-city').value);
    const s = await deepTranslate(document.getElementById('in-street').value);
    document.getElementById('out-contact').innerHTML = `<div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div><div><b>${d.email}</b> ${document.getElementById('in-email').value}</div><div><b>${d.addr}</b> ${document.getElementById('in-zip').value} ${c}, ${s} ${document.getElementById('in-house').value}</div>`;
    let html = "";
    const sum = await deepTranslate(document.getElementById('in-summary').value);
    if(sum) html += `<h3>${d.summary}</h3><p>${sum}</p>`;
    const lic = await deepTranslate(document.getElementById('in-license').value);
    if(lic) html += `<h3>${d.license}</h3><p>${lic}</p>`;
    for (let type of ['edu', 'work']) {
        let items = "";
        document.querySelectorAll('#' + type + '-container .entry-box').forEach(async box => {
            const m = await deepTranslate(box.querySelector('.e-main').value);
            const sub = box.querySelector('.e-sub').value;
            const desc = await deepTranslate(box.querySelector('.e-desc').value);
            if(m || desc) items += `<div><b>${m}</b> (${sub})<br><span style="color:${szin}">${desc}</span></div>`;
        });
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }
    const sk = await deepTranslate(document.getElementById('in-skills').value);
    if(sk) html += `<h3>${d.skills}</h3><p>${sk}</p>`;
    document.getElementById('main-content').innerHTML = html;
}
function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
window.onload = () => { updateInterface(); updatePreview(); };
