import type { LibraryPayload } from '../types';

export async function fetchLibrary(): Promise<LibraryPayload> {
  const res = await fetch('/api/music', { headers: { 'Accept': 'application/json' }});
  if (!res.ok) throw new Error('Failed to load library');
  return res.json();
}
