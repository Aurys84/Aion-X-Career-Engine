let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInterface(); // Frissíti az ATS tippeket és a label-eket
    updatePreview(); 
}

async function deepTranslate(text) {
    if (!text) return "";
    try {
        // AUTODETECT: Bármit írsz be, a célnyelvre (currentLang) teszi!
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updateInterface() {
    const d = dictionary[currentLang];
    // Ez frissíti a bal oldali sötét panelen az ATS tippeket és a label-eket
    for (let key in d) {
        const el = document.getElementById('lbl-' + key);
        if (el) el.innerText = d[key];
    }
}

async function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    const d = dictionary[currentLang];
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV: Fordítás autodetect-tel (Hogy ha angolul írod, németre fordítsa, stb.)
    const rawName = document.getElementById('in-name').value;
    const trName = await deepTranslate(rawName);
    document.getElementById('out-name').innerText = trName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    // CÍM ÉS KAPCSOLAT
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const zip = document.getElementById('in-zip').value;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.addr}</b> ${currentLang === 'hu' ? city + ', ' + street + ' ' + zip : zip + ' ' + city + ', ' + street}
        </div>
    `;

    // TÖBBI TARTALOM (Summary, Work, Edu) fordítása...
    renderContent(szin);
}

// ... a loadPhoto, addEntry és a többi marad
