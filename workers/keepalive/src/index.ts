/**
 * Supabase keep-alive.
 *
 * Free-tier Supabase projects are paused after 7 days without activity. This
 * worker makes one cheap authenticated REST call per day so the project always
 * counts as active. RLS means the anon key sees no rows — a 200 with `[]` is
 * the expected, successful result.
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const worker = {
  async scheduled(_event: unknown, env: Env): Promise<void> {
    const url = `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/profiles?select=id&limit=1`;

    try {
      const res = await fetch(url, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      });
      console.log(`keepalive: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error("keepalive: request failed", err);
    }
  },
};

export default worker;
