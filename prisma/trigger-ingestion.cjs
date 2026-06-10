// Trigger real job ingestion from RSS feeds (Remotive + Arbeitnow)
// Run with: agy-node prisma/trigger-ingestion.cjs

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const CRON_SECRET = env.CRON_SECRET;
const SITE_URL = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function triggerIngestion() {
  const ingestionUrl = `${SITE_URL}/api/jobs/import`;
  console.log(`Triggering job ingestion at: ${ingestionUrl}`);
  
  try {
    const result = await makeRequest(ingestionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${result.data}`);
  } catch (err) {
    console.error('Ingestion trigger failed:', err.message);
    console.log('\nNote: Make sure the Next.js dev server is running at', SITE_URL);
    console.log('Then run this script again, or trigger manually via:');
    console.log(`  curl -H "Authorization: Bearer ${CRON_SECRET}" ${SITE_URL}/api/jobs/import`);
  }
}

triggerIngestion();
