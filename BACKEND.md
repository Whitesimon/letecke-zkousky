# Backend: účet + synchronizace mimo claude.ai (Supabase)

Na **claude.ai** se postup ukládá k Claude účtu automaticky. Tenhle návod je pro **vlastní hosting** (GitHub Pages atd.), kde Claude účet není – přidáme skutečné přihlášení e-mailem a synchronizaci přes [Supabase](https://supabase.com) (má zdarma tarif).

Kód už je v appce hotový a **vypnutý**, dokud nevyplníš `config.js`. Zapnutí je na ~10 minut.

## 1. Založ Supabase projekt
1. Jdi na <https://supabase.com> → **Sign in** → **New project**. Zvol jméno, heslo k databázi a region (klidně EU).
2. Počkej ~2 min, než se projekt vytvoří.

## 2. Vytvoř tabulku a bezpečnostní pravidla
V Supabase otevři **SQL Editor** → **New query**, vlož a spusť:

```sql
create table if not exists public.progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  k          text not null,
  data       jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, k)
);

alter table public.progress enable row level security;

create policy "read own"   on public.progress for select using (auth.uid() = user_id);
create policy "insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "update own" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.progress for delete using (auth.uid() = user_id);
```

Pravidla (RLS) zajistí, že každý vidí a mění **jen svoje** řádky – i když je `anon` klíč veřejný.

## 3. Zapni přihlášení e-mailem
1. **Authentication → Providers → Email**: nech zapnuté. Pro odkaz do e-mailu stačí „Magic Link".
2. **Authentication → URL Configuration**: do **Site URL** a **Redirect URLs** přidej adresu svého webu (např. `https://<ty>.github.io/letecke-zkousky/`). Jinak odkaz z e-mailu nepřesměruje zpět.

## 4. Vlož klíče do appky
1. **Project Settings → API**: zkopíruj **Project URL** a **anon public** klíč.
2. Otevři `config.js` a vyplň:
   ```js
   window.SKYCFG = {
     supabaseUrl: 'https://TVUJPROJEKT.supabase.co',
     supabaseAnonKey: 'eyJ... (anon public)'
   };
   ```
3. Commitni a nasaď (push na GitHub – viz [DEPLOY.md](DEPLOY.md)).

## 5. Hotovo
Na webu otevři **Moje statistiky** → karta **Synchronizace napříč zařízeními** → zadej e-mail → klikni na odkaz v e-mailu. Od té chvíle se postup ukládá k účtu a drží mezi mobilem i počítačem.

> Anon klíč v `config.js` je bezpečné mít veřejně – data chrání RLS pravidla z kroku 2. Nikdy ale nedávej do `config.js` „service_role" klíč.

---

## (Pokročilé, volitelné) Denní push oznámení i při zavřené appce
Tlačítko „Zapnout připomínky" dnes používá `periodicSync` (Chrome/Android, best-effort). Spolehlivé denní doručení i na iOS a při zavřené appce vyžaduje **server, který push pošle**:

1. **VAPID klíče:** `npx web-push generate-vapid-keys`.
2. **Tabulka odběrů:** ulož `PushSubscription` každého zařízení (user_id, endpoint, keys) do tabulky `push_subs` s RLS jako výše.
3. **Klient:** po povolení oznámení zavolat `registration.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: <VAPID public> })` a odběr uložit do `push_subs`. (service worker už `push` událost zpracovává – viz `sw.js`.)
4. **Edge Function** (Supabase → Functions) s knihovnou `web-push`, která projde `push_subs` a pošle oznámení; VAPID private drž jako secret funkce.
5. **Plán:** spouštěj funkci jednou denně přes **Supabase → Database → Cron** (pg_cron) nebo externí cron.

Tohle je nejnáročnější část; až na ni dojde, napiš a dodělám edge funkci i klientský odběr.
