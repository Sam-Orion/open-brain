import Supermemory from 'supermemory';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const key = env.split('\n').find(l => l.startsWith('SUPERMEMORY_API_KEY')).split('=')[1].trim();

console.log("Key length:", key.length);

const client = new Supermemory({ apiKey: key });

client.documents.list({limit: 1}).then(console.log).catch(e => console.error("Error:", e.message));
