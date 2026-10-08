# Letecké zkoušky – PPL / LAPL / SPL

Studijní web pro přípravu na teoretické zkoušky pilota (PPL, LAPL, SPL) v ČR.
Statická single-page aplikace — HTML + JS, data v JSON.

## Struktura

| Soubor | Obsah |
|--------|-------|
| `index.html` | celá aplikace (UI + logika) |
| `questions.json` | databáze otázek (~600 kB) |
| `explain.json` | vysvětlení a komentáře k otázkám (~550 kB) |
| `img/` | obrázky k otázkám (schémata, mapy, tabulky) |

## Spuštění lokálně

Appka načítá `questions.json`/`explain.json` přes `fetch()`, takže **nestačí otevřít `index.html` dvojklikem** (prohlížeč zablokuje `file://` fetch). Spusť lokální server v této složce:

```bash
# Python (bývá všude)
python -m http.server 8000
```

```bash
# nebo Node
npx serve .
```

Pak otevři <http://localhost:8000>.

## PWA / nasazení / backend
Appka má `manifest.json` + `sw.js` (service worker), takže jde přidat na plochu mobilu a běžet offline — viz [DEPLOY.md](DEPLOY.md) (nasazení na GitHub Pages je automatické přes `.github/workflows/deploy.yml`). Na claude.ai Artifactu PWA neběží (sandbox), zato tam funguje ukládání postupu k účtu.

Synchronizace postupu mezi zařízeními funguje: na **claude.ai** přes Claude účet, na **vlastním hostingu** přes Supabase po vyplnění `config.js` — viz [BACKEND.md](BACKEND.md). Bez nastavení se ukládá jen lokálně v prohlížeči.

## Funkce
- učební režim s okamžitým správným řešením a vysvětlením
- náhodné / sekvenční pořadí otázek, sledování postupu
- opakování chyb (jen neúspěšné otázky)
- **označené otázky (hvězdičky)** + režim „Označené" pro cílené opakování
- simulace zkoušky na čas
- výběr témat, míchání odpovědí
- **denní série 🔥** + **denní cíl 🎯** (nastavitelný počet otázek/den, počítadlo pokroku)
- **historie zkoušek nanečisto** s trendem (poslední / nejlepší / zlepšení)
- **odhad připravenosti** ve statistikách (pravidlo 75 % na předmět)
- klávesa **F** = označit otázku; **A–D / 1–4** = odpověď; **←/→** = navigace
- **chytré opakování (SRS)** 🧠 – otázky se vracejí ve správný čas
- **dnešní dávka** – 20 otázek na míru (slabé + nové) se shrnutím
- **opakuj špatné, dokud je nezvládneš** (doučování)
- **graf pokroku v čase** 📈 (úspěšnost / prošlé otázky)
- **zvuk + vibrace** odezvy, **velikost písma**, **úvodní obrazovka**
- **sdílení výsledku** zkoušky jako obrázek 📤
- **vyhledávání otázek** (podle čísla nebo textu) 🔎
- **vlastní poznámky** k otázkám (ukládají se k účtu) 📝
- **barevné tečky zvládnutí** u témat (zelená/žlutá/červená podle úspěšnosti)
- **swipe gesta** na mobilu (další/předchozí otázka)
- **„Přidat na plochu"** (nativní instalační nabídka, když je dostupná)
- **přepínač motivu** (světlý / tmavý / auto)
- **denní připomínky** (oznámení; nejlíp po přidání na plochu – viz [DEPLOY.md](DEPLOY.md))
- statistiky k Claude účtu (napříč zařízeními), jinak lokálně v prohlížeči

## Zdroje dat
- PPL/LAPL: zveřejněná část databáze ÚCL (cca 75 %, zbytek je neveřejný)
- SPL: český překlad databáze ECQB poskytnutý aeroklubem
- vysvětlení a diagramy generované AI — mohou obsahovat nepřesnosti, v nejasných případech platí výklad instruktora

## Původ
Forknuto z Claude Artifactu do lokálního projektu dne 2026-10-07.
Kredit: AK Hodkovice nad Mohelkou.
