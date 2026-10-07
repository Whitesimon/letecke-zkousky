// Synchronizace účtu a oznámení MIMO claude.ai (na vlastním hostingu – GitHub Pages apod.).
// Na claude.ai se tohle ignoruje (tam synchronizaci řeší Claude účet).
//
// Nech prázdné = backend vypnutý (ukládá se jen lokálně v prohlížeči).
// Pro zapnutí vyplň hodnoty ze svého Supabase projektu – návod v BACKEND.md.
// Pozn.: "anon" i "vapidPublicKey" jsou určené k veřejnému použití (data chrání RLS), commit do gitu je OK.
window.SKYCFG = {
  supabaseUrl: 'https://blkcngavyxxnlcimufxu.supabase.co',
  supabaseAnonKey: 'sb_publishable_TND98SpeFq3gepx5Eg3lgw_sTd4Jfk2',
  vapidPublicKey: ''     // veřejný VAPID klíč pro push oznámení (volitelné; návod v BACKEND.md)
};
