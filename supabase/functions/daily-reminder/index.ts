// Supabase Edge Function: rozešle denní push oznámení všem uloženým odběrům.
// Nasazení a plán: viz BACKEND.md (sekce Push oznámení).
//
// Secrets (Supabase -> Edge Functions -> Secrets), nastav:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (např. mailto:ty@email.cz)
// (SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY jsou k dispozici automaticky.)

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const MSGS = [
  'Nauč se dnes něco nového ✈️',
  'Pár otázek denně a zkouška je tvoje 💪',
  'Čas na procvičování! Dej si 10 otázek.',
  'Meteo, navigace, předpisy… co si dnes zopakuješ?',
  'Krok ke zkoušce: 5 minut procvičování stačí.',
]

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com',
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  const { data: subs, error } = await sb.from('push_subs').select('endpoint, sub')
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const payload = JSON.stringify({
    title: 'ÚCL Zkoušky',
    body: MSGS[Math.floor(Math.random() * MSGS.length)],
  })

  let sent = 0, removed = 0
  for (const row of subs ?? []) {
    try {
      await webpush.sendNotification(row.sub, payload)
      sent++
    } catch (e) {
      // 404/410 = odběr už neplatí -> smazat
      const code = (e as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) {
        await sb.from('push_subs').delete().eq('endpoint', row.endpoint)
        removed++
      }
    }
  }
  return new Response(JSON.stringify({ sent, removed, total: subs?.length ?? 0 }), {
    headers: { 'content-type': 'application/json' },
  })
})
