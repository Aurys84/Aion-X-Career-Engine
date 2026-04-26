let mode = 'hu';
let profilKepData = "";

function previewKep() {
    const file = document.getElementById('kep-input').files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        profilKepData = reader.result;
        document.getElementById('kep-preview').src = reader.result;
        document.getElementById('kep-preview').style.display = 'block';
    };
    if (file) reader.readAsDataURL(file);
}

function setMode(m, btn) {
    mode = m;
    document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function addEntry(type) {
    const container = document.getElementById(type + '-list');
    const div = document.createElement('div');
    div.className = 'dynamic-entry';
    div.innerHTML = `
        <input type="text" placeholder="Intézmény-Cég / Institution-Company" class="e-main">
        <input type="text" placeholder="Év / Year" class="e-sub" style="width:30%">
        <input type="text" placeholder="Beosztás / Role" class="e-desc">
    `;
    container.appendChild(div);
}

async function translate(text, lang) {
    if (!text || mode === 'hu') return "";
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hu|${lang}`);
        const data = await res.json();
        return data.responseData.translatedText || "";
    } catch (e) { return ""; }
}

async function generalas() {
    const lang = mode; // Csak hu, en, de (mivel kivettük a mixet)
    const szin = document.getElementById('szinvalaszto').value;
    const btn = document.querySelector('.gen-btn');
    btn.innerText = "SZINKRONIZÁLÁS...";

    const adatok = {
        nev: document.getElementById('nev').value,
        cim: document.getElementById('cim').value,
        tel: document.getElementById('tel').value,
        email: document.getElementById('email').value,
        bemutat: document.getElementById('bemutat').value,
        kesz: document.getElementById('kesz').value
    };

    // Fordítások indítása
    const trNev = await translate(adatok.nev, lang);
    const trCim = await translate(adatok.cim, lang);
    const trBemutat = await translate(adatok.bemutat, lang);
    const trKesz = await translate(adatok.kesz, lang);

    const L = (k) => interfaceDict[lang][k];

    // Iskolák és munkahelyek feldolgozása
    const processSection = async (type) => {
        let h = "";
        const items = document.querySelectorAll('#' + type + '-list .dynamic-entry');
        for (let item of items) {
            const m = item.querySelector('.e-main').value;
            const s = item.querySelector('.e-sub').value;
            const d = item.querySelector('.e-desc').value;
            const trD = await translate(d, lang);
            h += `<div style="margin-bottom:15px">
                <strong style="font-size:14px;">${m}</strong><br>
                <small style="color:#666;">${s}</small><br>
                <span style="font-weight:bold; color:${szin}; text-transform:uppercase;">${trD || d}</span>
            </div>`;
        }
        return h;
    };

    const eduHtml = await processSection('edu');
    const workHtml = await processSection('work');

    const htmlContent = `
        <html><head><style>
            body { font-family: sans-serif; display: flex; margin: 0; min-height: 100vh; }
            .sidebar { background: ${szin}; color: white; width: 30%; padding: 30px; -webkit-print-color-adjust: exact; }
            .main { width: 70%; padding: 40px; background: white; }
            .p-img { width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; object-fit: cover; margin-bottom: 20px; }
            h1 { margin:0; text-transform: uppercase; color: ${szin}; font-size: 24px; }
            h3 { border-bottom: 2px solid ${szin}; color: ${szin}; text-transform: uppercase; font-size: 14px; margin-top: 25px; }
            .sidebar h3 { color: white; border-bottom: 1px solid rgba(255,255,255,0.3); }
            p { font-size: 13px; line-height: 1.6; margin-bottom: 10px; white-space: pre-line; }
            @media print { .no-print { display:none; } }
        </style></head>
        <body>
            <div class="sidebar">
                ${profilKepData ? `<img src="${profilKepData}" class="p-img">` : ''}
                <h3>${L('c')}</h3><p>${trCim || adatok.cim}</p>
                <p>${adatok.tel}<br>${adatok.email}</p>
                ${adatok.kesz ? `<h3>${L('s')}</h3><p>${trKesz || adatok.kesz}</p>` : ''}
            </div>
            <div class="main">
                <h1>${trNev || adatok.nev}</h1>
                ${adatok.bemutat ? `<h3>${L('p')}</h3><p>${trBemutat || adatok.bemutat}</p>` : ''}
                ${eduHtml ? `<h3>${L('e')}</h3>${eduHtml}` : ''}
                ${workHtml ? `<h3>${L('ex')}</h3>${workHtml}` : ''}
            </div>
            <button onclick="window.print()" style="position:fixed; top:10px; right:10px;" class="no-print">NYOMTATÁS</button>
        </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(htmlContent);
    win.document.close();
    btn.innerText = "GENERÁLÁS";
}
