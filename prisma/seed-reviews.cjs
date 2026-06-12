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

const TURSO_URL = env.TURSO_DATABASE_URL;
const TURSO_TOKEN = env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function seedReviews() {
  console.log('Connecting to Turso DB to seed reviews...');

  // Get company IDs
  const companiesRes = await db.execute("SELECT id, slug, name FROM Company");
  const companies = companiesRes.rows;
  console.log(`Fetched ${companies.length} companies from Turso.`);

  const getCompanyId = (slug) => {
    const company = companies.find(c => c.slug === slug);
    return company ? company.id : null;
  };

  const stripeId = getCompanyId('stripe');
  const vercelId = getCompanyId('vercel');
  const googleId = getCompanyId('google');
  const shopifyId = getCompanyId('shopify');

  // Clear existing reviews
  await db.execute("DELETE FROM CompanyReview");
  console.log('Cleared existing company reviews.');

  const mockReviews = [
    {
      companyId: stripeId,
      roleTitle: 'Software Engineer',
      rating: 5,
      pros: 'Excellent compensation packages, highly talented peers, and a culture that truly values engineering excellence and code quality.',
      cons: 'Heavy workload and high performance expectations can occasionally lead to long hours, especially before major product launches.',
      adviceToManagement: 'Keep developer velocity high by continuing to invest in internal developer tooling and automation.',
      isCurrentEmployee: 1
    },
    {
      companyId: stripeId,
      roleTitle: 'Product Manager',
      rating: 4,
      pros: 'Stripe is an incredible brand to have on your resume. You get to work on massive financial scale problems with smart stakeholders.',
      cons: 'Decision making can sometimes feel slow due to the size of the organization and the need for cross-team alignments.',
      adviceToManagement: 'Empower individual teams to move faster with fewer check-ins.',
      isCurrentEmployee: 0
    },
    {
      companyId: vercelId,
      roleTitle: 'Frontend Engineer',
      rating: 5,
      pros: 'Dream job for frontend developers. The focus on Next.js, design quality, speed, and overall user experience is top-notch.',
      cons: 'Fast-paced startup environment where priorities can shift quickly. You need to be highly self-motivated and adaptable.',
      adviceToManagement: 'Maintain the strong open-source contribution focus.',
      isCurrentEmployee: 1
    },
    {
      companyId: googleId,
      roleTitle: 'Senior Site Reliability Engineer',
      rating: 4,
      pros: 'Unmatched scale, incredible benefit packages, free food, and a very smart, collaborative team structure.',
      cons: 'The company has grown very large, resulting in complex bureaucratic processes even for simple internal changes.',
      adviceToManagement: 'Streamline promotion tracks and reduce administrative overhead.',
      isCurrentEmployee: 1
    },
    {
      companyId: shopifyId,
      roleTitle: 'UX Designer',
      rating: 5,
      pros: 'Shopify has a deeply ingrained design culture. Design has a seat at the leadership table, and collaboration is very smooth.',
      cons: 'Remote work across different time zones requires a lot of documentation and written alignment, which takes time.',
      adviceToManagement: 'Continue supporting asynchronous work practices and reduce recurring meetings.',
      isCurrentEmployee: 1
    }
  ];

  let inserted = 0;
  const now = new Date().toISOString();

  for (const rev of mockReviews) {
    if (!rev.companyId) {
      console.warn(`Skipping mock review: Company slug not found.`);
      continue;
    }

    const id = `rev_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString().slice(-4)}`;
    
    try {
      await db.execute({
        sql: `INSERT INTO CompanyReview (id, companyId, roleTitle, rating, pros, cons, adviceToManagement, isCurrentEmployee, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, rev.companyId, rev.roleTitle, rev.rating, rev.pros, rev.cons, rev.adviceToManagement, rev.isCurrentEmployee, now, now]
      });
      inserted++;
      console.log(`✓ Seeded review for: ${rev.roleTitle} (${rev.rating} Stars)`);
    } catch (err) {
      console.error(`✗ Failed to seed review for ${rev.roleTitle}:`, err.message);
    }
  }

  console.log(`\nSuccessfully seeded ${inserted}/${mockReviews.length} company reviews.`);
  db.close();
}

seedReviews().catch(err => {
  console.error('Seed reviews failed:', err);
  process.exit(1);
});
