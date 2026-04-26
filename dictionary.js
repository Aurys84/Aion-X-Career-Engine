// FIX SZAKMAI KIFEJEZÉSEK (Hogy ne kelljen mindenért API-t hívni)
const omniDict = [
    { hu: "Vagyonőr", en: "Security Guard", de: "Sicherheitskraft" },
    { hu: "Takarító", en: "Cleaner", de: "Reinigungskraft" },
    { hu: "Üzletvezető helyettes", en: "Assistant Store Manager", de: "Filialleiter-Assistent" },
    { hu: "Igazgató helyettes", en: "Assistant Director", de: "Stv. Direktor" },
    { hu: "Általános iskola", en: "Primary School", de: "Grundschule" },
    { hu: "Szakmunkásképző", en: "Vocational School", de: "Berufsschule" },
    { hu: "Főiskola", en: "College", de: "Fachhochschule" },
    { hu: "Érettségi", en: "High School Diploma", de: "Abitur" },
    { hu: "Középfok", en: "Intermediate", de: "Mittelstufe" },
    { hu: "Alapfok", en: "Elementary", de: "Grundstufe" },
    { hu: "B kategória", en: "Category B", de: "Klasse B" },
    { hu: "Jogosítvány", en: "Driving License", de: "Führerschein" },
    { hu: "Személyautó", en: "Passenger car", de: "PKW" },
    { hu: "Utca", en: "Street", de: "Straße" },
    { hu: "Zenehallgatás", en: "Listening to music", de: "Musik hören" },
    { hu: "Sport", en: "Sports", de: "Sport" },
    { hu: "Olvasás", en: "Reading", de: "Lesen" }
];

// INTERFÉSZ ÉS PAPÍR FELIRATOK
const dictionary = {
    hu: { 
        name:"Név", zip:"Irsz.", city:"Város", street:"Utca", house:"Házszám", 
        phone:"Tel:", email:"Email:", summary:"Profil", work:"Munkahelyek", 
        edu:"Iskolák", skills:"Készségek", license:"Jogosítvány", hobby:"Hobbi", 
        addr:"Cím:", addW:"+ Új Munkahely", addE:"+ Új Iskola"
    },
    en: { 
        name:"Name", zip:"ZIP", city:"City", street:"Street", house:"No.", 
        phone:"Phone:", email:"Email:", summary:"Summary", work:"Experience", 
        edu:"Education", skills:"Skills", license:"License", hobby:"Hobbies", 
        addr:"Address:", addW:"+ Add Job", addE:"+ Add Edu"
    },
    de: { 
        name:"Name", zip:"PLZ", city:"Stadt", street:"Straße", house:"Hausnr.", 
        phone:"Tel:", email:"Email:", summary:"Profil", work:"Erfahrung", 
        edu:"Ausbildung", skills:"Kenntnisse", license:"Führerschein", hobby:"Hobby", 
        addr:"Adresse:", addW:"+ Job", addE:"+ Schule"
    }
};
