function getSupabaseAdminConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env');
  }

  return {
    url,
    key,
    restUrl: `${url.replace(/\/$/, '')}/rest/v1`
  };
}

function headers(extra = {}) {
  const { key } = getSupabaseAdminConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra
  };
}

export async function supabaseAdminGet(resource, params = {}) {
  const { restUrl } = getSupabaseAdminConfig();
  const url = new URL(`${restUrl}/${resource}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text().catch(() => '')}`);
  return response.json();
}

export async function supabaseAdminPost(resource, payload, prefer = 'return=representation') {
  const { restUrl } = getSupabaseAdminConfig();
  const response = await fetch(`${restUrl}/${resource}`, {
    method: 'POST',
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text().catch(() => '')}`);
  return response.json();
}

export async function supabaseAdminPatch(resource, params, payload) {
  const { restUrl } = getSupabaseAdminConfig();
  const url = new URL(`${restUrl}/${resource}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text().catch(() => '')}`);
  return response.json();
}
