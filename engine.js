let currentLang = 'hu';

async function apiTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${currentLang}`);
        const data = await res.json();
        const tr = data.responseData.translatedText;
        return (tr && !tr.includes("LIMIT")) ? tr : text;
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
    const vez = document.getElementById('in-lastName').value || "";
    const ker = document.getElementById('in-firstName').value || "";
    // PAPÍR LOGIKA: HU esetén Vezetéknév Keresztnév | Egyéb: Keresztnév Vezetéknév
    let fullName = (currentLang === 'hu') ? vez + " " + ker : ker + " " + vez;
    document.getElementById('out-name').innerText = fullName.trim().toUpperCase() || "NAME";
    renderPaper();
}

async function renderPaper() {
    const d = dictionary[currentLang];
    const city = await apiTranslate(document.getElementById('in-city').value);
    const sName = document.getElementById('in-street').value;
    const house = document.getElementById('in-house').value;
    const sTypeSelect = document.getElementById('in-street-type');
    const sType = sTypeSelect.options[sTypeSelect.selectedIndex].text.split(' / ')[currentLang === 'hu' ? 0 : (currentLang === 'en' ? 1 : 2)];

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phoneLabel}:</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.emailLabel}:</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}:</b> ${city}, ${sName} ${sType} ${house}</div>
    `;

    let html = "";
    const sum = document.getElementById('in-summary').value;
    if(sum) html += `<h3>${d.summary}</h3><p>${await apiTranslate(sum)}</p>`;

    // Iskola renderelés
    let eduHtml = "";
    const eduBoxes = document.querySelectorAll('#edu-container .entry-box');
    for (let box of eduBoxes) {
        const school = box.querySelector('.e-main').value;
        const years = box.querySelector('.e-sub').value;
        const dbVal = box.querySelector('.e-db').value;
        const other = box.querySelector('.e-other').value;
        let degree = (dbVal !== "other") ? careerDB.eduLevels.find(x => x.hu === dbVal)[currentLang] : await apiTranslate(other);
        if(school) eduHtml += `<div class="item"><b>${school}</b> - ${degree} (${years})</div>`;
    }
    if(eduHtml) html += `<h3>${d.edu}</h3>` + eduHtml;

    // Munkahely renderelés
    let workHtml = "";
    const workBoxes = document.querySelectorAll('#work-container .entry-box');
    for (let box of workBoxes) {
        const company = box.querySelector('.e-main').value;
        const years = box.querySelector('.e-sub').value;
        const jobDb = box.querySelector('.e-job-db').value;
        const jobOther = box.querySelector('.e-job-other').value;
        const posDb = box.querySelector('.e-pos-db').value;
        const posOther = box.querySelector('.e-pos-other').value;

        let job = (jobDb !== "other") ? careerDB.jobs.find(x => x.hu === jobDb)[currentLang] : await apiTranslate(jobOther);
        let pos = (posDb !== "other") ? careerDB.positions.find(x => x.hu === posDb)[currentLang] : await apiTranslate(posOther);

        if(company) workHtml += `<div class="item"><b>${company}</b>: ${job} (${pos}) - ${years}</div>`;
    }
    if(workHtml) html += `<h3>${d.work}</h3>` + workHtml;

    document.getElementById('main-content').innerHTML = html;
}

function addEntry(type) {
    const div = document.createElement('div');
    div.className = 'entry-box';
    if(type === 'edu') {
        let opts = careerDB.eduLevels.map(x => `<option value="${x.hu}">${x.hu}</option>`).join('');
        div.innerHTML = `
            <input type="text" class="e-main" placeholder="Iskola neve">
            <input type="text" class="e-sub" placeholder="Év /tól-ig/">
            <select class="e-db"><option value="other">EGYÉB VÉGZETTSÉG (API)</option>${opts}</select>
            <input type="text" class="e-other" placeholder="Saját végzettség...">`;
    } else {
        let jobOpts = careerDB.jobs.map(x => `<option value="${x.hu}">${x.hu}</option>`).join('');
        let posOpts = careerDB.positions.map(x => `<option value="${x.hu}">${x.hu}</option>`).join('');
        div.innerHTML = `
            <input type="text" class="e-main" placeholder="Munkahely neve">
            <input type="text" class="e-sub" placeholder="Év /tól-ig/">
            <select class="e-job-db"><option value="other">EGYÉB FOGLALKOZÁS (API)</option>${jobOpts}</select>
            <input type="text" class="e-job-other" placeholder="Saját foglalkozás...">
            <select class="e-pos-db"><option value="other">EGYÉB BEOSZTÁS (API)</option>${posOpts}</select>
            <input type="text" class="e-pos-other" placeholder="Saját beosztás...">`;
    }
    document.getElementById(type + '-container').appendChild(div);
    div.querySelectorAll('input, select').forEach(el => el.oninput = updatePreview);
}

window.onload = () => {
    const colors = ["#007bb5", "#e67e22", "#27ae60", "#c0392b", "#8e44ad", "#1a1a1a", "#f1c40f", "#16a085", "#d35400", "#2c3e50"];
    colors.forEach(c => {
        let b = document.createElement('div'); b.className = 'color-btn'; b.style.background = c;
        b.onclick = () => { document.documentElement.style.setProperty('--main-color', c); updatePreview(); };
        document.getElementById('color-picker').appendChild(b);
    });
    for(let i=1; i<=10; i++) {
        let b = document.createElement('button'); b.className = 'style-btn'; b.innerText = i;
        b.onclick = () => { document.body.className = 'style-' + i; updatePreview(); };
        document.getElementById('style-picker').appendChild(b);
    }
    updateInterface();
};

function loadPhoto(e) {
    const r = new FileReader();
    r.onload = () => { document.getElementById('out-photo').src = r.result; document.getElementById('out-photo-box').style.display='block'; };
    r.readAsDataURL(e.target.files[0]);
}
