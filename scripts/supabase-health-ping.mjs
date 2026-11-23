// Read-only Supabase activity check for the free project.
// Does not modify inventory, customer data, or store settings.
import { readFile } from 'node:fs/promises';

try {
  const html = await readFile('index.html', 'utf8');
  const match = html.match(/SB_URL='(https:\/\/[^']+)',SB_KEY='(sb_publishable_[^']+)'/);
  if (!match) throw new Error('Could not find website publishable Supabase configuration');

  const url = new URL(match[1]);
  if (url.origin !== 'https://zocommwqqtrdxdoxlwfy.supabase.co') {
    throw new Error('Unexpected Supabase project; stopping');
  }
  // The publishable key is deliberately never logged.
  const response = await fetch(url.origin + '/rest/v1/vuhiep_store?id=eq.main&select=id', {
    headers: { apikey: match[2] },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Supabase health check HTTP ' + response.status);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0].id !== 'main') {
    throw new Error('Store row cannot be read with the publishable key');
  }
  console.log('Supabase activity check: online; read-only query succeeded.');
} catch (err) {
  console.error('Supabase activity check failed: ' + err.message);
  process.exitCode = 1;
}
