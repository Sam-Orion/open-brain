import Supermemory from 'supermemory';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const key = env.split('\n').find(l => l.startsWith('SUPERMEMORY_API_KEY')).split('=')[1].trim();

const client = new Supermemory({ apiKey: key });

client.search.memories({q: "*"}).then(console.log).catch(e => console.error("Search Error:", e.message));
