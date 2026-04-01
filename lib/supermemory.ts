import Supermemory from 'supermemory';

export function getSupermemoryClient() {
  if (!process.env.SUPERMEMORY_API_KEY) {
    throw new Error('SUPERMEMORY_API_KEY is not defined in environment variables');
  }

  const client = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY,
  });

  return client;
}
