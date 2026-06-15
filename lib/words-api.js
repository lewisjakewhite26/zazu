/**
 * Load Zazu words from Supabase (falls back to inline WORDS if config missing).
 * Include after public/config.js and the Supabase CDN script in zazu.html.
 */

(function () {
  const DEFAULT_WORDS = typeof WORDS !== 'undefined' ? WORDS : [];

  function getClient() {
    const cfg = window.ZAZU_CONFIG;
    if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) return null;
    if (typeof supabase === 'undefined' || !supabase.createClient) return null;
    return supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  async function fetchWords(options = {}) {
    const client = getClient();
    if (!client) {
      console.warn('[Zazu] No Supabase config — using inline WORDS fallback');
      return DEFAULT_WORDS;
    }

    const tier = options.tier ?? null;
    const { data, error } = await client.rpc('get_words_for_app', { p_tier: tier });

    if (error) {
      console.error('[Zazu] Supabase fetch failed:', error.message);
      return DEFAULT_WORDS;
    }

    return (data || []).map(({ word, pronunciation, pos, definition, origin, tier: t, rounds }) => ({
      word,
      pronunciation,
      pos,
      definition,
      origin,
      tier: t,
      rounds,
    }));
  }

  window.ZazuWords = {
    fetch: fetchWords,
    getClient,
  };
})();
