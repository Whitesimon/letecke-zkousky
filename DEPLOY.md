# Nasazení a PWA

Appka je obyčejná statická stránka (HTML + JSON + obrázky), takže ji nahraješ kamkoli, co umí servírovat statické soubory. Cesty jsou relativní, takže funguje i v podsložce.

## Důležité – kde co funguje

| Prostředí | „Na plochu" (PWA) + offline | Ukládání postupu |
|-----------|:--:|---|
| **claude.ai Artifact** | ❌ (sandbox, service worker neběží) | ✅ k Claude účtu, napříč zařízeními |
| **Vlastní hosting (GitHub Pages…)** | ✅ ano | ⚠️ lokálně; ✅ napříč zařízeními po zapnutí Supabase ([BACKEND.md](BACKEND.md)) |

Appka pozná prostředí sama: na claude.ai synchronizuje přes Claude účet, na vlastním hostingu přes Supabase (když je vyplněný `config.js`), jinak jen lokálně. Push oznámení i při zavřené appce vyžadují server – viz [BACKEND.md](BACKEND.md).

## GitHub Pages (zdarma) – nasazení automaticky přes Actions

V repu je `.github/workflows/deploy.yml`, takže po každém pushi na `main` se web sám nasadí.

1. Vytvoř repozitář na GitHubu (např. `letecke-zkousky`).
2. V této složce:
   ```bash
   git remote add origin https://github.com/<ty>/letecke-zkousky.git
   git branch -M main
   git push -u origin main
   ```
3. Na GitHubu: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Počkej, až proběhne akce (**záložka Actions**). Web poběží na `https://<ty>.github.io/letecke-zkousky/`.
5. Na mobilu v Chrome/Safari → menu → **Přidat na plochu**. Appka pojede na celou obrazovku, s ikonou, i offline.
6. (Volitelně) chceš, aby postup držel mezi zařízeními i tady? Zapni Supabase podle [BACKEND.md](BACKEND.md) a do **Site URL / Redirect URLs** dej adresu z bodu 4.

> HTTPS (které GitHub Pages dává automaticky) je pro PWA povinné. Na `http://` kromě `localhost` service worker neběží.

## Lokální test

```bash
python -m http.server 8000
```
Pak <http://localhost:8000>. (Service worker na `localhost` funguje, takže offline/PWA jde otestovat i tady — ne ale ve vestavěném náhledovém prohlížeči Claude.)

## Cesta na App Store / Google Play (později)

Hotovou PWA lze zabalit do nativní appky bez přepisování:
- **Android:** [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) / PWABuilder → TWA → `.aab` do Google Play.
- **iOS:** [PWABuilder](https://www.pwabuilder.com/) nebo wrapper (Capacitor) → `.ipa` do App Store.

Před tím je ale potřeba vyřešit **backend** (účty + synchronizace + push oznámení), protože Claude účet je dostupný jen uvnitř claude.ai.
