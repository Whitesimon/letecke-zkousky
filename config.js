// Synchronizace účtu MIMO claude.ai (na vlastním hostingu – GitHub Pages apod.).
// Na claude.ai se tohle ignoruje (tam synchronizaci řeší Claude účet).
//
// Nech prázdné = backend vypnutý (ukládá se jen lokálně v prohlížeči).
// Pro zapnutí vyplň obě hodnoty ze svého Supabase projektu – návod v BACKEND.md.
// Pozn.: "anon" klíč je určený k veřejnému použití (chrání ho RLS pravidla), commit do gitu je OK.
window.SKYCFG = {
  supabaseUrl: '',       // např. https://abcdefgh.supabase.co
  supabaseAnonKey: ''    // veřejný "anon public" klíč
};
