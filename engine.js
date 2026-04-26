let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview(); // Nyelvváltáskor azonnal újrarajzol mindent a célnyelven
}

async function deepTranslate(text) {
    if (!text) return "";
    try {
        // AUTODETECT: Bármilyen nyelven írsz, a kiválasztott (currentLang) nyelvre fordít!
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updatePreview() {
    // Alapadatok azonnali átvitele (nincs várakozás, hogy látszódjon az írás!)
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    document.getElementById('out-name').innerText = document.getElementById('in-name').value || "NÉV / NAME";
    document.getElementById('out-name').style.color = szin;
    
    // A többi adatot a háttérben fordítjuk
    renderContent(szin);
}

async function renderContent(szin) {
    const d = dictionary[currentLang];
    
    // Cím és Contact adatok
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const house = document.getElementById('in-house').value;
    const zip = document.getElementById('in-zip').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${currentLang === 'hu' ? city+', '+street+' '+house+', '+zip : zip+' '+city+', '+street+' '+house}</div>
    `;

    let mainHtml = "";
    
    // Profil / Summary
    const sum = document.getElementById('in-summary').value;
    if(sum) mainHtml += `<h3>${d.summary}</h3><p>${await deepTranslate(sum)}</p>`;

    // Jogosítvány
    const lic = document.getElementById('in-license').value;
    if(lic) mainHtml += `<h3>${d.license}</h3><p>${await deepTranslate(lic)}</p>`;

    // Készségek
    const sk = document.getElementById('in-skills').value;
    if(sk) mainHtml += `<h3>${d.skills}</h3><p>${await deepTranslate(sk)}</p>`;

    document.getElementById('main-content').innerHTML = mainHtml;
}

window.onload = updatePreview;

