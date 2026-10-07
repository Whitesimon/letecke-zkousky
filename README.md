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

## PWA / nasazení
Appka má `manifest.json` + `sw.js` (service worker), takže jde přidat na plochu mobilu a běžet offline — viz [DEPLOY.md](DEPLOY.md). Na claude.ai Artifactu PWA neběží (sandbox), zato tam funguje ukládání postupu k účtu.

## Funkce
- učební režim s okamžitým správným řešením a vysvětlením
- náhodné / sekvenční pořadí otázek, sledování postupu
- opakování chyb (jen neúspěšné otázky)
- simulace zkoušky na čas
- výběr témat, míchání odpovědí
- statistiky uložené lokálně v prohlížeči (nic se neodesílá)

## Zdroje dat
- PPL/LAPL: zveřejněná část databáze ÚCL (cca 75 %, zbytek je neveřejný)
- SPL: český překlad databáze ECQB poskytnutý aeroklubem
- vysvětlení a diagramy generované AI — mohou obsahovat nepřesnosti, v nejasných případech platí výklad instruktora

## Původ
Forknuto z Claude Artifactu do lokálního projektu dne 2026-10-07.
Kredit: AK Hodkovice nad Mohelkou.
