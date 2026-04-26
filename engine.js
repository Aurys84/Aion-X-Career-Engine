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
    // Ha a beírt szöveg fix (pl: Vagyonőr), a szótárból rántjuk elő
    let found = omniDict.find(e => e.hu.toLowerCase() === text.trim().toLowerCase());
    if (found) return found[currentLang];

    try {
        // NÉV ÉS TARTALOM FORDÍTÁS: autodetect -> célnyelv
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV FRISSÍTÉS (Először kiírjuk, amit beírtál, hogy ne akadjon a gépelés)
    const rawName = document.getElementById('in-name').value;
    document.getElementById('out-name').innerText = rawName || "NAME";
    document.getElementById('out-name').style.color = szin;
    
    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const rawName = document.getElementById('in-name').value;

    // NÉV FORDÍTÁSA/FORMÁZÁSA: Ha nem magyar, megpróbálja a nemzetközi formátumot
    let finalName = rawName;
    if (currentLang !== 'hu' && rawName.includes(" ")) {
        // Megfordítjuk a sorrendet (Csonka Norbert -> Norbert Csonka)
        const parts = rawName.split(" ");
        finalName = parts.reverse().join(" ");
    }
    // Ha van benne fordítható rész (pl. beosztás a név mellett), az API lekezeli
    const trName = await deepTranslate(finalName);
    document.getElementById('out-name').innerText = trName || "NAME";

    // Cím fordítása
    const c = await deepTranslate(document.getElementById('in-city').value);
    const s = await deepTranslate(document.getElementById('in-street').value);
    const h = document.getElementById('in-house').value;
    const z = document.getElementById('in-zip').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${currentLang==='hu' ? c+', '+s+' '+h+' '+z : z+' '+c+', '+s+' '+h}</div>
    `;

    // Szekciók (Summary, Edu, Work, Skills)
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
            if(m || desc) items += `<div><b>${m}</b> (${sub})<br><span style="color:${szin}">${desc}</span></div>`;
        }
        if(items) html += `<h3>${d[type]}</h3>` + items;
    }

    const sk = await deepTranslate(document.getElementById('in-skills').value);
    if(sk) html += `<h3>${d.skills}</h3><p>${sk}</p>`;

    document.getElementById('main-content').innerHTML = html;
}

// ... a többi marad (loadPhoto, addEntry, updateInterface, stb.)
