const fs = require('fs');
const key = fs.readFileSync('.env.local', 'utf-8').match(/SUPERMEMORY_API_KEY=(.*)/)[1];
console.log("Starts with 'sm_':", key.startsWith('sm_'));
console.log("Length:", key.length);
console.log("Trailing invisible characters:", JSON.stringify(key[key.length-1]));
