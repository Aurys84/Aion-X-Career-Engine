let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
}

function omniTranslate(text) {
    if (!text || currentLang === 'hu') return text;
    let res = text;
    omniDict.forEach(entry => {
        for (let key in entry) {
            let reg = new RegExp(entry[key], "gi");
            if (text.match(reg)) { res = res.replace(reg, entry[currentLang]); break; }
        }
    });
    return res;
}

function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `
        <input type="text" placeholder="Név / Name" class="e-main" oninput="updatePreview()">
        <input type="text" placeholder="Év / Year" class="e-sub" style="margin:5px 0" oninput="updatePreview()">
        <input type="text" placeholder="Leírás / Position" class="e-desc" oninput="updatePreview()">`;
    container.appendChild(div);
}

function updatePreview() {
    // Feliratok frissítése
    const labels = ['name','zip','city','street','house','phone','email','summary','skills','license','hobby'];
    labels.forEach(f => { document.getElementById('lbl-'+f).innerText = dictionary[currentLang][f]; });
    
    document.getElementById('lbl-work-h').innerText = dictionary[currentLang].work;
    document.getElementById('lbl-edu-h').innerText = dictionary[currentLang].edu;

    // Kontakt adatok
    const n = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = (currentLang !== 'hu' && n.includes(" ")) ? n.split(" ").reverse().join(" ") : n || "NAME";
    
    const phone = document.getElementById('in-phone').value;
    const email = document.getElementById('in-email').value;
    const z = document.getElementById('in-zip').value;
    const c = omniTranslate(document.getElementById('in-city').value);
    const s = omniTranslate(document.getElementById('in-street').value);
    const h = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div class="contact-row"><span class="contact-label">${dictionary[currentLang].phone}</span> ${phone}</div>
        <div class="contact-row"><span class="contact-label">${dictionary[currentLang].email}</span> ${email}</div>
        <div class="contact-row"><span class="contact-label">${dictionary[currentLang].addr}</span> ${currentLang !== 'hu' ? z+' '+c+', '+s+' '+h : c+', '+s+' '+h+', '+z}</div>`;

    // Szekciók generálása (Edu, Work, Skills, stb.)
    let mainHtml = "";
    const sum = omniTranslate(document.getElementById('in-summary').value);
    if(sum) mainHtml += `<p style="font-size:13px;"><i>${sum}</i></p>`;

    ['edu', 'work'].forEach(type => {
        let itemsHtml = "";
        document.querySelectorAll('#'+type+'-container .entry-box').forEach(e => {
            const m = omniTranslate(e.querySelector('.e-main').value);
            const sub = e.querySelector('.e-sub').value;
            const d = omniTranslate(e.querySelector('.e-desc').value);
            if(m || d) itemsHtml += `<div class="item-box"><span class="item-main">${m}</span><span class="item-sub">${sub}</span><span class="item-desc">${d}</span></div>`;
        });
        if(itemsHtml) mainHtml += `<h3>${dictionary[currentLang][type]}</h3>` + itemsHtml;
    });

    ['skills', 'license', 'hobby'].forEach(k => {
        const val = omniTranslate(document.getElementById('in-' + k).value);
        if(val) mainHtml += `<h3>${dictionary[currentLang][k]}</h3><div style="white-space:pre-wrap; font-size:13px;">${val}</div>`;
    });
    document.getElementById('main-content').innerHTML = mainHtml;
}
