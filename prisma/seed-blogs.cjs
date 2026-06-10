// Standalone seed script using require() — avoids ESM module resolution issues
// Run with: agy-node prisma/seed-plain.cjs

const { createClient } = require('@libsql/client');
const path = require('path');

// Load .env manually
const fs = require('fs');
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

const blogPosts = [
  {
    slug: 'how-to-write-an-ats-friendly-resume',
    title: 'How to Write an ATS-Friendly Resume in 2026',
    excerpt: 'Most modern companies use automated Applicant Tracking Systems to filter resumes before humans see them. Learn the exact structures, typography, and keywords that will pass these systems and get you interviews.',
    featuredImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'salary-negotiation-secrets-tech-recruiter',
    title: 'Salary Negotiation: Secrets from a Tech Recruiter',
    excerpt: 'Never leave money on the table. Discover standard timelines, script anchors, and flexible perks that help negotiate 15% to 30% higher total compensation packages.',
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'best-companies-hiring-remote-software-engineers-2026',
    title: 'The 50 Best Companies Hiring Remote Software Engineers in 2026',
    excerpt: 'A curated list of the most actively hiring remote-first companies for software engineers in 2026 — covering startups, scale-ups, and enterprise employers that have proven remote-friendly cultures.',
    featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'react-developer-interview-questions-2026',
    title: 'React Developer Interview Questions: Complete 2026 Edition',
    excerpt: 'Prepare for your next React engineering interview with this complete guide — covering hooks, state management, performance optimization, testing, and system design questions asked at top companies.',
    featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'how-to-find-first-remote-developer-job',
    title: 'How to Find Your First Remote Developer Job in 2026',
    excerpt: 'Breaking into remote work as a developer is harder than it looks — but very achievable with the right strategy. This guide covers portfolio building, networking, and the exact application tactics that get responses.',
    featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'remote-work-europe-digital-nomad-visas-guide',
    title: 'Remote Work in Europe: Digital Nomad Visas and What You Need to Know',
    excerpt: 'A practical guide to European digital nomad visa programs in 2026 — covering Portugal, Spain, Germany, Estonia, and Croatia. Understand tax implications, income requirements, and application processes.',
    featuredImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'top-remote-companies-product-designers-2026',
    title: 'Top 10 Remote-First Companies for Product Designers in 2026',
    excerpt: 'Product design is one of the most successfully remote-adapted disciplines in tech. This guide ranks the best remote-first employers for UI/UX designers, with compensation ranges and what makes each unique.',
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'remote-work-tools-stack-distributed-teams',
    title: 'Remote Work Tools: The Stack Successful Distributed Teams Actually Use',
    excerpt: 'After surveying 50+ remote-first companies, we identified the tools that actually make distributed teams productive — from communication platforms to async video, project management, and developer tooling.',
    featuredImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'prepare-technical-interview-remote-company',
    title: 'How to Prepare for a Technical Interview at a Remote Company',
    excerpt: 'Remote technical interviews have unique dynamics. This guide covers the preparation strategy, technical formats, system design communication, and remote-specific questions that distinguish top candidates.',
    featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'understanding-equity-stock-options-remote-startups',
    title: 'Understanding Equity and Stock Options at Remote Startups',
    excerpt: 'Equity is often the biggest variable in startup compensation but the least understood. This guide explains ISOs, NSOs, RSUs, vesting schedules, dilution, and how to evaluate equity offers at remote tech companies.',
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'future-of-remote-work-trends-2026',
    title: 'The Future of Remote Work: Trends Shaping 2026 and Beyond',
    excerpt: 'Remote work has permanently reshaped how companies operate and how professionals build careers. This analysis covers the trends defining distributed work in 2026 — from AI-assisted collaboration to asynchronous-first cultures.',
    featuredImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'time-zone-management-working-across-continents',
    title: 'Time Zone Management: Working Across Continents',
    excerpt: 'Working in a distributed team means collaborating across different time zones. Learn how to manage asynchronous communication, set boundaries, and use tools to stay productive without burning out.',
    featuredImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'how-to-stand-out-applying-competitive-remote-roles',
    title: 'How to Stand Out When Applying for Competitive Remote Roles',
    excerpt: 'Remote job postings can receive hundreds of applicants within hours. Discover the exact strategies to differentiate your application, optimize your cover letter, and leverage video introductions to stand out.',
    featuredImage: 'https://images.unsplash.com/photo-1521791136368-1a8682707636?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: '10-resume-mistakes-to-avoid-in-tech',
    title: '10 Resume Mistakes to Avoid in Tech',
    excerpt: 'Even highly skilled tech professionals make common resume mistakes that lead to instant rejections. From generic objective statements to missing GitHub links, learn what to clean up today.',
    featuredImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'best-job-boards-remote-tech-jobs',
    title: 'The Best Job Boards for Remote Tech Jobs',
    excerpt: 'Looking for remote work in tech? Discover the top niche platforms and job boards that filter out low-quality listings and aggregate authentic remote roles across software, design, and product.',
    featuredImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
  },
];

async function seedBlogPosts() {
  console.log('Connecting to Turso DB...');
  
  // Get the admin user id
  const adminRows = await db.execute("SELECT id FROM User WHERE email = 'admin@jobpickers.com' LIMIT 1");
  if (adminRows.rows.length === 0) {
    console.error('Admin user not found. Run full seed first.');
    process.exit(1);
  }
  const adminId = adminRows.rows[0].id;
  console.log('Admin ID:', adminId);

  // Delete existing blog posts
  await db.execute("DELETE FROM BlogPost");
  console.log('Cleared existing blog posts.');

  let inserted = 0;
  for (const post of blogPosts) {
    const id = `bp_${post.slug.replace(/-/g, '_').slice(0, 20)}_${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const content = `<p>${post.excerpt}</p><p>Read the full article for in-depth career advice from the JobPickers editorial team.</p>`;
    
    try {
      await db.execute({
        sql: `INSERT INTO BlogPost (id, title, slug, excerpt, content, featuredImage, authorId, status, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
        args: [id, post.title, post.slug, post.excerpt, content, post.featuredImage, adminId, now, now]
      });
      inserted++;
      console.log(`✓ Inserted: ${post.title}`);
    } catch (err) {
      console.error(`✗ Failed to insert "${post.title}":`, err.message);
    }
  }

  console.log(`\nDone! Inserted ${inserted}/${blogPosts.length} blog posts.`);
  db.close();
}

seedBlogPosts().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
