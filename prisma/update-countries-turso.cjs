const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

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

const isTurso = !!env.TURSO_DATABASE_URL;
const dbUrl = env.TURSO_DATABASE_URL || 'file:prisma/dev.db';
const dbToken = env.TURSO_AUTH_TOKEN || '';

console.log(`Connecting to database: ${dbUrl} (Turso: ${isTurso})`);

const db = createClient({ url: dbUrl, authToken: dbToken });

// Mirror local parser from lib/ai.ts
function detectLocationDetails(locationStr) {
  const locLower = (locationStr || '').toLowerCase();
  
  // Default values
  let remoteType = 'remote';
  if (locLower.includes('hybrid')) {
    remoteType = 'hybrid';
  } else if (!locLower.includes('remote') && locLower.length > 2) {
    remoteType = 'onsite';
  }

  const city = locationStr.split(',')[0].trim() || 'Not Specified';
  let country = 'US'; // Default fallback
  
  const deCities = [
    'berlin', 'munich', 'münchen', 'cologne', 'köln', 'frankfurt', 'hamburg', 'düsseldorf', 'dusseldorf', 
    'stuttgart', 'nuremberg', 'nürnberg', 'karlsruhe', 'bonn', 'essen', 'leipzig', 'bremen', 'dresden', 
    'hannover', 'heidelberg', 'ratingen', 'bielefeld', 'haar', 'potsdam', 'oberhaching', 'neuhaus', 
    'winnenden', 'lehrte', 'andechs', 'ostfildern', 'backnang', 'wesenberg', 'mannheim', 'darmstadt', 
    'nördlingen', 'noerdlingen', 'leonberg', 'bad krozingen', 'spaichingen', 'oberhausen', 'aschaffenburg', 
    'würzburg', 'wuerzburg', 'allgäu', 'allgaeu', 'göttingen', 'goettingen', 'vechta', 'hessen', 'bayern', 
    'deutschland', 'germany'
  ];

  const gbTerms = ['united kingdom', 'uk', 'gb', 'london', 'manchester', 'birmingham', 'leeds', 'bristol', 'scotland', 'england', 'ireland', 'dublin'];
  const caTerms = ['canada', 'ca', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'alberta', 'ontario', 'quebec'];
  const auTerms = ['australia', 'au', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'];
  const frTerms = ['france', 'fr', 'paris', 'lyon', 'marseille', 'toulouse', 'nice'];
  const nlTerms = ['netherlands', 'holland', 'nl', 'amsterdam', 'rotterdam', 'utrecht', 'hague', 'eindhoven'];
  const esTerms = ['spain', 'espana', 'madrid', 'barcelona', 'valencia', 'seville', 'malaga'];
  const inTerms = ['india', 'in', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai', 'noida'];
  const sgTerms = ['singapore', 'sg'];
  const brTerms = ['brazil', 'brasil', 'sao paulo', 'rio de janeiro', 'belo horizonte'];
  const jpTerms = ['japan', 'jp', 'tokyo', 'osaka', 'kyoto', 'yokohama'];
  const cnTerms = ['china', 'cn', 'beijing', 'shanghai', 'shenzhen'];

  if (locLower.includes('worldwide') || locLower.includes('global') || locLower.includes('anywhere')) {
    country = 'Remote';
  } else if (deCities.some(city => locLower.includes(city))) {
    country = 'DE';
  } else if (gbTerms.some(term => locLower.includes(term))) {
    country = 'GB';
  } else if (caTerms.some(term => locLower.includes(term))) {
    country = 'CA';
  } else if (auTerms.some(term => locLower.includes(term))) {
    country = 'AU';
  } else if (frTerms.some(term => locLower.includes(term))) {
    country = 'FR';
  } else if (nlTerms.some(term => locLower.includes(term))) {
    country = 'NL';
  } else if (esTerms.some(term => locLower.includes(term))) {
    country = 'ES';
  } else if (inTerms.some(term => locLower.includes(term))) {
    country = 'IN';
  } else if (sgTerms.some(term => locLower.includes(term))) {
    country = 'SG';
  } else if (brTerms.some(term => locLower.includes(term))) {
    country = 'BR';
  } else if (jpTerms.some(term => locLower.includes(term))) {
    country = 'JP';
  } else if (cnTerms.some(term => locLower.includes(term))) {
    country = 'CN';
  } else if (locLower.includes('remote') || locLower.trim() === '') {
    country = 'Remote';
  } else if (locLower.includes('usa') || locLower.includes('united states') || locLower.includes('us') || 
             /,\s*(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b/.test(locLower)) {
    country = 'US';
  } else {
    const parts = locationStr.split(',');
    if (parts.length > 1) {
      const parsedCountry = parts[parts.length - 1].trim();
      if (parsedCountry.length > 2) {
        country = parsedCountry;
      }
    }
  }

  return { country, city };
}

async function runUpdate() {
  const jobsRes = await db.execute("SELECT id, location, title FROM Job");
  const jobs = jobsRes.rows;
  console.log(`Fetched ${jobs.length} jobs from database.`);

  let updatedCount = 0;
  const countryCounts = {};

  for (const job of jobs) {
    const { country, city } = detectLocationDetails(job.location);
    
    await db.execute({
      sql: "UPDATE Job SET country = ?, city = ? WHERE id = ?",
      args: [country, city, job.id]
    });

    countryCounts[country] = (countryCounts[country] || 0) + 1;
    updatedCount++;
  }

  console.log('\n--- Country Migration Summary ---');
  console.log(`Successfully updated ${updatedCount}/${jobs.length} jobs.`);
  console.log('Country Code Distribution:');
  console.log(JSON.stringify(countryCounts, null, 2));

  db.close();
}

runUpdate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
