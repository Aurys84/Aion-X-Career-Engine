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
    let found = omniDict.find(e => e.hu.toLowerCase() === text.trim().toLowerCase());
    if (found) return found[currentLang];
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${currentLang}`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) { return text; }
}

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV FIX: Oda-vissza logika
    const rawName = document.getElementById('in-name').value;
    let finalName = rawName;
    if (currentLang !== 'hu' && rawName.includes(" ")) {
        const parts = rawName.split(" ");
        finalName = parts[1] + " " + parts[0]; // Megfordítja (Csonka Norbert -> Norbert Csonka)
    }
    document.getElementById('out-name').innerText = finalName || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const zip = document.getElementById('in-zip').value; // ZIP FIX
    const house = document.getElementById('in-house').value;

    document.getElementById('out-contact').innerHTML = `
        <div><b>${d.phone}</b> ${document.getElementById('in-phone').value}</div>
        <div><b>${d.email}</b> ${document.getElementById('in-email').value}</div>
        <div><b>${d.addr}</b> ${currentLang==='hu' ? city+', '+street+' '+house+', '+zip : zip+' '+city+', '+street+' '+house}</div>
    `;

    // ... (Summary, Edu, Work, Skills ciklusok maradnak)
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
function updateInterface() { /* Dictionary alapú label frissítés */ }
window.onload = () => { updatePreview(); };
