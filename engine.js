let currentLang = 'hu';

function setMode(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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

function updatePreview() {
    const szin = document.getElementById('theme-color').value;
    document.documentElement.style.setProperty('--main-color', szin);
    
    // NÉV LOGIKA: Mindig a beírt sorrendből indulunk ki
    const rawName = document.getElementById('in-name').value;
    let finalName = rawName;
    
    if (rawName.includes(" ")) {
        let parts = rawName.split(" ");
        // HU: Vezetéknév Keresztnév | EN/DE: Keresztnév Vezetéknév
        if (currentLang !== 'hu') {
            finalName = parts[1] + " " + parts[0];
        } else {
            finalName = parts[0] + " " + parts[1];
        }
    }
    
    document.getElementById('out-name').innerText = finalName.toUpperCase() || "NAME";
    document.getElementById('out-name').style.color = szin;

    renderAsync(szin);
}

async function renderAsync(szin) {
    const d = dictionary[currentLang];
    const zip = document.getElementById('in-zip').value;
    const city = await deepTranslate(document.getElementById('in-city').value);
    const street = await deepTranslate(document.getElementById('in-street').value);
    const house = document.getElementById('in-house').value;

    // KONTAKT SORREND FIX
    let addrHtml = currentLang === 'hu' ? 
        `${city}, ${street} ${house}, ${zip}` : 
        `${zip} ${city}, ${street} ${house}`;

    document.getElementById('out-contact').innerHTML = `
        <div style="margin-top:10px;">
            <b>${d.phone}</b> ${document.getElementById('in-phone').value}<br>
            <b>${d.email}</b> ${document.getElementById('in-email').value}<br>
            <b>${d.addr}</b> ${addrHtml}
        </div>
    `;

    // Ciklusok (Edu/Work) és Fordítások
    let mainHtml = "";
    const boxes = document.querySelectorAll('.entry-box');
    // ... (itt marad a korábbi ciklusod a tartalomhoz)
}

function updateStyle() { document.body.className = document.getElementById('style-select').value; }
function updateTheme() { updatePreview(); }
function addEntry(type) {
    const container = document.getElementById(type + '-container');
    const div = document.createElement('div');
    div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="e-main" placeholder="Cég/Iskola" oninput="updatePreview()"><input type="text" class="e-sub" placeholder="Év" oninput="updatePreview()">`;
    container.appendChild(div);
}
window.onload = updatePreview;
