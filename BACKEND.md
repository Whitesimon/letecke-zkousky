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

## 6. Denní push oznámení (i na iPhonu, i při zavřené appce)
Klient i service worker i edge funkce jsou **už hotové** – stačí projít nastavení. Na iPhonu push funguje jen když je appka **přidaná na plochu** (iOS 16.4+) a otevřená odtud.

### 6a. Tabulka odběrů
V **SQL Editoru** spusť:
```sql
create table if not exists public.push_subs (
  endpoint   text primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  sub        jsonb not null,
  created_at timestamptz default now()
);
alter table public.push_subs enable row level security;
create policy "insert own" on public.push_subs for insert with check (auth.uid() = user_id);
create policy "update own" on public.push_subs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.push_subs for delete using (auth.uid() = user_id);
```

### 6b. VAPID klíče
Na počítači spusť:
```bash
npx web-push generate-vapid-keys
```
Dostaneš **Public** a **Private** klíč. Public vlož do `config.js` → `vapidPublicKey`. Private si nech pro krok 6d (nikdy ne do gitu!).

### 6c. Nasazení edge funkce
Potřebuješ [Supabase CLI](https://supabase.com/docs/guides/cli). V kořeni projektu:
```bash
supabase login
supabase link --project-ref <REF z URL projektu>
supabase functions deploy daily-reminder
```
(Soubor funkce je přiložený v `supabase/functions/daily-reminder/index.ts`.)

### 6d. Secrets funkce
```bash
supabase secrets set VAPID_PUBLIC_KEY="<public>" VAPID_PRIVATE_KEY="<private>" VAPID_SUBJECT="mailto:tvuj@email.cz"
```

### 6e. Denní plán (cron)
V **SQL Editoru** zapni rozšíření a naplánuj (čas je UTC – `0 16 * * *` ≈ 18:00 v ČR):
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('daily-reminder', '0 16 * * *', $$
  select net.http_post(
    url     := 'https://<REF>.functions.supabase.co/daily-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SUPABASE_ANON_KEY>',
      'Content-Type', 'application/json'
    )
  );
$$);
```
> Ruční test: `curl -X POST https://<REF>.functions.supabase.co/daily-reminder -H "Authorization: Bearer <ANON_KEY>"`.

### 6f. Zapnutí na zařízení
Nasaď web, otevři ho (na iPhonu z plochy!), přihlas se, ve „Statistikách" → **Zapnout připomínky**. Appka si uloží odběr a edge funkce ti bude každý den posílat oznámení.
