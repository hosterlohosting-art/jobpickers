// JOBPICKERS AI ENRICHMENT LAYER
// Integrates OpenAI completions using direct fetch calls to keep dependencies lightweight, with local regex fallbacks

interface AIAnalysisResult {
  title: string;
  category: string;
  skills: string[];
  summary: string;
  isSpam: boolean;
  location: {
    country: string;
    city: string;
    remoteType: 'remote' | 'hybrid' | 'onsite';
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

// 1. Local Fallback Engines (Active if OPENAI_API_KEY is not configured)
function runLocalEnrichment(title: string, description: string, locationStr: string): AIAnalysisResult {
  const descLower = description.toLowerCase();
  const titleLower = title.toLowerCase();

  // Title Normalization
  let cleanTitle = title
    .replace(/\bSr\b\.?/gi, 'Senior')
    .replace(/\bJr\b\.?/gi, 'Junior')
    .replace(/\bEng\b\.?/gi, 'Engineer')
    .replace(/\bDev\b\.?/gi, 'Developer')
    .replace(/\bPM\b/g, 'Product Manager')
    .replace(/\s*-\s*Remote/gi, '')
    .trim();

  // Category Detection
  let category = 'Software';
  if (descLower.includes('design') || descLower.includes('ux') || descLower.includes('ui') || descLower.includes('figma')) {
    category = 'Design';
  } else if (descLower.includes('marketing') || descLower.includes('seo') || descLower.includes('growth')) {
    category = 'Marketing';
  } else if (descLower.includes('finance') || descLower.includes('accountant') || descLower.includes('cfo')) {
    category = 'Finance';
  } else if (descLower.includes('sales') || descLower.includes('account executive') || descLower.includes('quota')) {
    category = 'Sales';
  } else if (descLower.includes('support') || descLower.includes('help desk') || descLower.includes('customer success')) {
    category = 'Customer Support';
  } else if (descLower.includes('recruiting') || descLower.includes('hr ') || descLower.includes('human resources')) {
    category = 'HR';
  } else if (descLower.includes('data scientist') || descLower.includes('dataset') || descLower.includes('sql') && descLower.includes('analytics')) {
    category = 'Data';
  }

  // Skills Extraction
  const commonSkills = ['React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'AWS', 'Figma', 'SEO', 'Salesforce', 'Excel', 'Django', 'Kubernetes', 'Docker'];
  const extractedSkills = commonSkills.filter(skill => descLower.includes(skill.toLowerCase()));

  // Summary builder (takes first 2 sentences from description HTML)
  const cleanText = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/);
  const summary = sentences.slice(0, 2).map(s => s.trim()).join('. ') + '.';

  // Spam detection rules
  const spamWords = ['telegram pay', 'earn $1000 daily', 'commission payouts', 'bitcoin cash', 'easy cash home job'];
  const isSpam = spamWords.some(w => descLower.includes(w) || titleLower.includes(w));

  // Location details parsing
  let remoteType: 'remote' | 'hybrid' | 'onsite' = 'remote';
  const locLower = locationStr.toLowerCase();
  if (locLower.includes('hybrid')) {
    remoteType = 'hybrid';
  } else if (!locLower.includes('remote') && locLower.length > 2) {
    remoteType = 'onsite';
  }

  const city = locationStr.split(',')[0].trim() || 'Not Specified';
  
  // Robust Worldwide Country Matcher
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
    // If location is "City, CountryName", try to extract CountryName
    const parts = locationStr.split(',');
    if (parts.length > 1) {
      const parsedCountry = parts[parts.length - 1].trim();
      if (parsedCountry.length > 2) {
        country = parsedCountry;
      }
    }
  }

  // SEO details
  const metaTitle = `${cleanTitle} Job at Company - JobPickers`;
  const metaDescription = `Apply to this ${cleanTitle} position. Location: ${locationStr}. ${summary.slice(0, 100)}...`;

  return {
    title: cleanTitle,
    category,
    skills: extractedSkills,
    summary: summary || 'No description summary available.',
    isSpam,
    location: { country, city, remoteType },
    seo: { metaTitle, metaDescription }
  };
}

// 2. OpenAI API completions logic
async function runOpenAIEnrichment(title: string, description: string, locationStr: string, apiKey: string): Promise<AIAnalysisResult | null> {
  try {
    const prompt = `Analyze this job posting:
Title: "${title}"
Location: "${locationStr}"
Description: "${description.replace(/<[^>]*>/g, ' ').slice(0, 2000)}"

Respond strictly in raw JSON matching the following schema. Do not invent details. If fields like salary are missing in text, report null (do not make up numbers).
JSON Schema:
{
  "title": "Normalized corporate job title",
  "category": "One of: Software, Marketing, Finance, Sales, Customer Support, Design, Data, HR",
  "skills": ["Skill1", "Skill2"],
  "summary": "2 sentence job summary based only on description",
  "isSpam": false,
  "location": {
    "country": "Detect country name or 'Remote'",
    "city": "Detect city name or null",
    "remoteType": "remote or hybrid or onsite"
  },
  "seo": {
    "metaTitle": "SEO optimized job page title (under 60 chars)",
    "metaDescription": "SEO optimized meta summary (under 150 chars)"
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    });

    if (!response.ok) throw new Error(`OpenAI API returned status ${response.status}`);
    const data = await response.json();
    const responseText = data.choices[0].message.content.trim();
    return JSON.parse(responseText) as AIAnalysisResult;
  } catch (error) {
    console.error('[OpenAIEnrichment] Fetch completion failed. Reverting to local parser:', error);
    return null;
  }
}

// 3. Exported Controller
export async function enrichJobDetails(title: string, description: string, locationStr: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const apiResult = await runOpenAIEnrichment(title, description, locationStr, apiKey);
    if (apiResult) return apiResult;
  }
  return runLocalEnrichment(title, description, locationStr);
}
