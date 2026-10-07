# Nasazení a PWA

Appka je obyčejná statická stránka (HTML + JSON + obrázky), takže ji nahraješ kamkoli, co umí servírovat statické soubory. Cesty jsou relativní, takže funguje i v podsložce.

## Důležité – kde co funguje

| Prostředí | „Na plochu" (PWA) + offline | Ukládání postupu |
|-----------|:--:|---|
| **claude.ai Artifact** | ❌ (sandbox, service worker neběží) | ✅ k Claude účtu, napříč zařízeními |
| **Vlastní hosting (GitHub Pages…)** | ✅ ano | ⚠️ jen lokálně na zařízení (Claude účet tam není) |

Opravdová synchronizace postupu mezi zařízeními **mimo** claude.ai by vyžadovala vlastní backend s přihlášením (Supabase/Firebase apod.) + push server pro denní oznámení. To je samostatný krok (viz níže).

## GitHub Pages (zdarma, nejjednodušší)

1. Vytvoř repozitář na GitHubu (např. `letecke-zkousky`).
2. V této složce:
   ```bash
   git remote add origin https://github.com/<ty>/letecke-zkousky.git
   git branch -M main
   git push -u origin main
   ```
3. Na GitHubu: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, složka `/ (root)`, ulož.
4. Za chvíli poběží na `https://<ty>.github.io/letecke-zkousky/`.
5. Otevři to na mobilu v Chrome/Safari → menu → **Přidat na plochu**. Appka pojede na celou obrazovku, s ikonou, i offline.

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
