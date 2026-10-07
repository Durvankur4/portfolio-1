import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore({ name: 'portfolio-metrics', consistency: 'strong' });
  const current = Number(await store.get('visits', { type: 'text', consistency: 'strong' })) || 0;
  const count = current + 1;
  await store.set('visits', String(count));
  return Response.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
};
