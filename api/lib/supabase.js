function getSupabaseConfig() {
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

export async function supabaseGet(resource, params = {}) {
  const { key, restUrl } = getSupabaseConfig();
  const url = new URL(`${restUrl}/${resource}`);
  for (const [k, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(k, value);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const error = new Error('Supabase request failed');
    error.status = response.status;
    error.providerResponse = await response.text().catch(() => '');
    throw error;
  }

  return response.json();
}
