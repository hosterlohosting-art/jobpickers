"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed operations...');
    // 1. Clean Database
    await prisma.adPlacement.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.applicationTracking.deleteMany({});
    await prisma.savedJob.deleteMany({});
    await prisma.importLog.deleteMany({});
    await prisma.jobSource.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Database cleaned. Seeding initial structures...');
    // 2. Create Users
    // In production, use bcrypt/argon2 to hash. For dev seed, simple hashes work.
    const admin = await prisma.user.create({
        data: {
            name: 'JobPickers Admin',
            email: 'admin@jobpickers.com',
            passwordHash: 'admin123', // Demo plaintext for seeding simplicity
            role: 'admin'
        }
    });
    const employerStripe = await prisma.user.create({
        data: {
            name: 'Stripe Recruiting',
            email: 'hiring@stripe.com',
            passwordHash: 'stripe123',
            role: 'employer'
        }
    });
    const seeker = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            passwordHash: 'john123',
            role: 'user'
        }
    });
    console.log('Users seeded.');
    // 3. Create Companies
    const stripe = await prisma.company.create({
        data: {
            name: 'Stripe',
            slug: 'stripe',
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=128&h=128&fit=crop&q=80',
            website: 'https://stripe.com',
            industry: 'Financial Technology',
            size: '500-1000',
            location: 'San Francisco, CA',
            description: 'Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.'
        }
    });
    const vercel = await prisma.company.create({
        data: {
            name: 'Vercel',
            slug: 'vercel',
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80',
            website: 'https://vercel.com',
            industry: 'Cloud Computing & Frontend Services',
            size: '100-500',
            location: 'New York, NY',
            description: 'Vercel provides the developer experience and infrastructure to build, deploy, and scale the frontend web. We empower creators to build faster, more collaborative, and highly performant digital applications.'
        }
    });
    const google = await prisma.company.create({
        data: {
            name: 'Google',
            slug: 'google',
            logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=128&h=128&fit=crop&q=80',
            website: 'https://google.com',
            industry: 'Technology & Cloud Solutions',
            size: '5000+',
            location: 'Mountain View, CA',
            description: 'Google is a global technology leader focused on improving the ways people connect with information. Googles innovations in web search and advertising have made its website a top internet property and its brand one of the most recognized in the world.'
        }
    });
    const shopify = await prisma.company.create({
        data: {
            name: 'Shopify',
            slug: 'shopify',
            logo: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=128&h=128&fit=crop&q=80',
            website: 'https://shopify.com',
            industry: 'E-Commerce Platforms',
            size: '1000-5000',
            location: 'Ottawa, Canada',
            description: 'Shopify is a leading global commerce company, providing trusted tools for starting, growing, marketing, and managing retail businesses of any size.'
        }
    });
    console.log('Companies seeded.');
    // 4. Create JobSources (Ingestion Connectors)
    const sourceIndeed = await prisma.jobSource.create({
        data: { name: 'Indeed Partner Feed', type: 'api', apiBaseUrl: 'https://api.indeed.com/v2', syncFrequency: 'daily', dailyLimit: 100, isActive: false }
    });
    const sourceLinkedIn = await prisma.jobSource.create({
        data: { name: 'LinkedIn Authorized Jobs API', type: 'api', apiBaseUrl: 'https://api.linkedin.com/v2', syncFrequency: 'daily', dailyLimit: 100, isActive: false }
    });
    const sourceGlassdoor = await prisma.jobSource.create({
        data: { name: 'Glassdoor API', type: 'api', apiBaseUrl: 'https://api.glassdoor.com/v1', syncFrequency: 'daily', dailyLimit: 100, isActive: false }
    });
    const sourceRSS = await prisma.jobSource.create({
        data: { name: 'RSSFeedConnector', type: 'rss', apiBaseUrl: 'https://remotive.com/api/remote-jobs', syncFrequency: 'daily', dailyLimit: 100, isActive: true }
    });
    const sourceManual = await prisma.jobSource.create({
        data: { name: 'Manual Postings', type: 'manual', syncFrequency: 'daily', dailyLimit: 100, isActive: true }
    });
    console.log('Job Sources seeded.');
    // 5. Create Job Listings
    const dateAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);
    const dateFuture = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const jobsData = [
        {
            title: 'Senior Backend Engineer (Node/Postgres)',
            slug: 'senior-backend-engineer-node-postgres-stripe-1',
            companyId: stripe.id,
            description: '<h3>About the Role</h3><p>We are seeking a Senior Backend Engineer to join our Payment Processing squad. You will build and scale APIs that handle billions of dollars in volume, optimize postgres schemas, and lead integrations with global bank networks.</p><h3>Requirements</h3><ul><li>5+ years of experience with Node.js and TypeScript</li><li>Deep knowledge of database indexings and PostgreSQL</li><li>Prior experience in payment routing or high-volume systems is a huge plus</li></ul>',
            requirements: 'TypeScript, Node.js, PostgreSQL, Distributed Systems',
            benefits: 'Health/Dental/Vision Insurance, Unlimited Paid Time Off, Home Office Stipend',
            salaryMin: 145000,
            salaryMax: 190000,
            location: 'San Francisco, CA (Remote)',
            country: 'US',
            city: 'San Francisco',
            remoteType: 'remote',
            employmentType: 'full-time',
            experienceLevel: 'senior',
            category: 'Software',
            skills: 'Node.js, PostgreSQL, TypeScript, API Design',
            sourceName: 'Employer',
            status: 'published',
            applyUrl: 'https://stripe.com/jobs',
            postedAt: dateAgo(2),
            expiresAt: dateFuture(30)
        },
        {
            title: 'Lead Frontend UI/UX Architect',
            slug: 'lead-frontend-ui-ux-architect-vercel-2',
            companyId: vercel.id,
            description: '<h3>About Vercel</h3><p>We build the frontend cloud. We are seeking a Lead Frontend Architect to scale our Next.js visual templates, coordinate development on Geist UI design system, and implement stunning animations.</p><h3>Responsibilities</h3><ul><li>Define frontend patterns across Next.js dashboards</li><li>Collaborate with UI designers in Figma</li><li>Optimize CSS render paint times</li></ul>',
            requirements: 'Next.js, Tailwind CSS, Web Performance, Design Systems',
            benefits: 'Mental wellness days, Full health benefits, Flexible hours',
            salaryMin: 150000,
            salaryMax: 200000,
            location: 'New York, NY (Hybrid)',
            country: 'US',
            city: 'New York',
            remoteType: 'hybrid',
            employmentType: 'full-time',
            experienceLevel: 'lead',
            category: 'Software',
            skills: 'Next.js, React, Tailwind CSS, CSS, Design Systems',
            sourceName: 'RSSFeedConnector',
            status: 'published',
            applyUrl: 'https://vercel.com/jobs',
            postedAt: dateAgo(6),
            expiresAt: dateFuture(24)
        },
        {
            title: 'Growth Marketing Manager',
            slug: 'growth-marketing-manager-shopify-3',
            companyId: shopify.id,
            description: '<h3>Growth Marketer Role</h3><p>Shopify Plus needs a data-driven marketer to scale enterprise merchant leads. You will define PPC pipelines, run SEO campaigns, and coordinate with sales leads to design marketing newsletters.</p>',
            requirements: 'Google Analytics 4, Lead Generation, SEO optimization',
            benefits: 'Equity options, Learning budget, Gym subsidy',
            salaryMin: 90000,
            salaryMax: 125000,
            location: 'Ottawa, Canada (Remote)',
            country: 'CA',
            city: 'Ottawa',
            remoteType: 'remote',
            employmentType: 'full-time',
            experienceLevel: 'mid',
            category: 'Marketing',
            skills: 'SEO, Google Ads, GA4, Growth Hacking',
            sourceName: 'RSSFeedConnector',
            status: 'published',
            applyUrl: 'https://shopify.com/jobs',
            postedAt: dateAgo(12),
            expiresAt: dateFuture(28)
        },
        {
            title: 'Customer Support Advocate',
            slug: 'customer-support-advocate-stripe-4',
            companyId: stripe.id,
            description: '<h3>Role Summary</h3><p>Support Stripe merchants globally by resolving API and account billing queries. You will draft clean document articles, test API queries, and work alongside support developers.</p>',
            requirements: 'Great English writing, basic SQL or coding familiarity',
            benefits: 'Full health cover, Work from home options',
            salaryMin: 55000,
            salaryMax: 80000,
            location: 'Chicago, IL',
            country: 'US',
            city: 'Chicago',
            remoteType: 'onsite',
            employmentType: 'full-time',
            experienceLevel: 'entry',
            category: 'Customer Support',
            skills: 'Technical Support, Customer Success, Ticket Management',
            sourceName: 'Indeed Partner Feed',
            status: 'published',
            applyUrl: 'https://stripe.com/jobs',
            postedAt: dateAgo(24),
            expiresAt: dateFuture(15)
        },
        {
            title: 'Data Science Specialist',
            slug: 'data-science-specialist-google-5',
            companyId: google.id,
            description: '<h3>Description</h3><p>Design next-generation machine learning classification logic for Google Cloud Analytics. You will leverage big datasets to construct predictions and draft dashboard reports.</p>',
            requirements: 'Python, SQL, PyTorch, BigQuery, ML pipelines',
            benefits: 'Free meals, Transit pass, Health savings accounts',
            salaryMin: 165000,
            salaryMax: 230000,
            location: 'Mountain View, CA (Onsite)',
            country: 'US',
            city: 'Mountain View',
            remoteType: 'onsite',
            employmentType: 'full-time',
            experienceLevel: 'senior',
            category: 'Data',
            skills: 'Python, PyTorch, SQL, Machine Learning',
            sourceName: 'LinkedIn Authorized Jobs API',
            status: 'published',
            applyUrl: 'https://google.com/jobs',
            postedAt: dateAgo(36),
            expiresAt: dateFuture(12)
        },
        {
            title: 'Brand Designer',
            slug: 'brand-designer-vercel-6',
            companyId: vercel.id,
            description: '<h3>Design Vercel Brand</h3><p>Vercel is seeking a graphic designer to build stunning visual assets for dev conferences, merchandise, and site illustrations.</p>',
            requirements: 'Figma, Vector illustrations, Adobe Illustrator',
            benefits: 'Home office budget, Unlimited PTO',
            salaryMin: 85000,
            salaryMax: 110000,
            location: 'Remote',
            country: 'US',
            remoteType: 'remote',
            employmentType: 'contract',
            experienceLevel: 'mid',
            category: 'Design',
            skills: 'Figma, Graphic Design, Branding, Vector Art',
            sourceName: 'Employer',
            status: 'published',
            applyUrl: 'https://vercel.com/jobs',
            postedAt: dateAgo(18),
            expiresAt: dateFuture(29)
        },
        {
            title: 'Financial Planning Analyst',
            slug: 'financial-planning-analyst-google-7',
            companyId: google.id,
            description: '<h3>Financial Analyst</h3><p>Manage budget allocations for Cloud infrastructure divisions. Calculate capital investments and draft forecast models.</p>',
            requirements: 'Excel wizard, Corporate finance experience, SQL is a plus',
            benefits: 'Pension matching, Top medical care',
            salaryMin: 110000,
            salaryMax: 145000,
            location: 'Mountain View, CA',
            country: 'US',
            city: 'Mountain View',
            remoteType: 'hybrid',
            employmentType: 'full-time',
            experienceLevel: 'mid',
            category: 'Finance',
            skills: 'Financial Modeling, Excel, Budgeting, Analytics',
            sourceName: 'Glassdoor API',
            status: 'published',
            applyUrl: 'https://google.com/jobs',
            postedAt: dateAgo(48),
            expiresAt: dateFuture(5)
        },
        {
            title: 'Sales Account Executive',
            slug: 'sales-account-executive-shopify-8',
            companyId: shopify.id,
            description: '<h3>Sales Account Executive</h3><p>Close enterprise subscription accounts for shopify plus in EMEA. Manage high-value leads and draft enterprise proposals.</p>',
            requirements: 'CRM pipelines, Enterprise sales, Negotiating agreements',
            benefits: 'Commission package, Travel cost coverage',
            salaryMin: 120000,
            salaryMax: 180000,
            location: 'London, UK (Hybrid)',
            country: 'GB',
            city: 'London',
            remoteType: 'hybrid',
            employmentType: 'full-time',
            experienceLevel: 'senior',
            category: 'Sales',
            skills: 'Salesforce, B2B Sales, Negotiation, CRM',
            sourceName: 'Indeed Partner Feed',
            status: 'published',
            applyUrl: 'https://shopify.com/jobs',
            postedAt: dateAgo(72),
            expiresAt: dateFuture(10)
        }
    ];
    for (const job of jobsData) {
        await prisma.job.create({
            data: job
        });
    }
    console.log('Job Listings seeded.');
    // 6. Create Blog Posts
    await prisma.blogPost.create({
        data: {
            title: 'How to Write an ATS-Friendly Resume in 2026',
            slug: 'how-to-write-an-ats-friendly-resume',
            excerpt: 'Most modern companies use automated Applicant Tracking Systems to filter resumes. Learn the exact structures, typography, and keywords that will pass the systems and get you interviews.',
            content: '<p>Applying for jobs in 2026 requires understanding automated parsing. Modern ATS scanners read text patterns looking for specific skills matches before human recruiters ever see your document.</p><h3>1. Keep Formatting Minimal</h3><p>Avoid columns, text boxes, and background gradients. Simple, single-column Microsoft Word or raw text PDFs parsed via Standard fonts work best.</p><h3>2. Match Keywords to Job Postings</h3><p>If the posting lists "React" or "PostgreSQL", do not abbreviate them to "JS libraries" or "databases". Match them exactly inside your skills array.</p><h3>3. Focus on Results</h3><p>Instead of listing "Responsible for database setups", write "Optimized PostgreSQL indexes to reduce API latency by 45%". Metrics win interviews.</p>',
            featuredImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            authorId: admin.id,
            status: 'published'
        }
    });
    await prisma.blogPost.create({
        data: {
            title: 'Salary Negotiation: Secrets from a Tech Recruiter',
            slug: 'salary-negotiation-secrets-tech-recruiter',
            excerpt: 'Never leave money on the table. Discover standard timelines, script anchors, and flexible perks that help negotiate 15% to 30% higher total compensation packages.',
            content: '<p>Negotiating salary is often stressful, but recruiters expect it. Understanding the market median and anchors allows you to discuss pay boundaries confidently.</p><h3>1. Wait for an Offer</h3><p>Do not disclose your target figures during initial phone screens. Keep target queries focused on "the total package value of the role."</p><h3>2. Focus on Sector Medians</h3><p>Research Indeed or Glassdoor benchmarks for your title in that specific geo. Use ranges rather than exact integers.</p><h3>3. Perks count</h3><p>If the base salary budget is locked, ask for relocation stipends, mental wellness allowances, or stock options multipliers.</p>',
            featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
            authorId: admin.id,
            status: 'published'
        }
    });
    console.log('Blog Posts seeded.');
    // 7. Create AdSense slots
    const adsData = [
        { name: 'homepage_top', page: 'homepage', position: 'top_banner', adCode: '<!-- Mock AdSense Code: Homepage Top Leaderboard -->' },
        { name: 'homepage_middle', page: 'homepage', position: 'middle_content', adCode: '<!-- Mock AdSense Code: Homepage Middle Board -->' },
        { name: 'job_sidebar', page: 'jobs', position: 'sidebar_ad', adCode: '<!-- Mock AdSense Code: Jobs Search Sidebar -->' },
        { name: 'job_details_summary', page: 'job_details', position: 'below_summary', adCode: '<!-- Mock AdSense Code: Job Details Below Summary -->' },
        { name: 'blog_in_content', page: 'blog_detail', position: 'in_content', adCode: '<!-- Mock AdSense Code: Blog Post Content Inline -->' },
        { name: 'blog_sidebar', page: 'blog_detail', position: 'sidebar_ad', adCode: '<!-- Mock AdSense Code: Blog Post Sidebar -->' },
        { name: 'footer', page: 'global', position: 'footer_ad', adCode: '<!-- Mock AdSense Code: Global Footer Banner -->' }
    ];
    for (const ad of adsData) {
        await prisma.adPlacement.create({
            data: ad
        });
    }
    console.log('AdSense placements seeded.');
    // 8. Add basic Saved Jobs / Applications logs for Seeker User
    const allJobs = await prisma.job.findMany({});
    if (allJobs.length > 0) {
        await prisma.savedJob.create({
            data: {
                userId: seeker.id,
                jobId: allJobs[0].id
            }
        });
        await prisma.applicationTracking.create({
            data: {
                userId: seeker.id,
                jobId: allJobs[1].id,
                status: 'applied',
                notes: 'Submitted resume via JobPickers redirect. Got automatic response.'
            }
        });
    }
    console.log('Saved jobs and tracking seeded successfully.');
    console.log('Seed operations complete! Default Admin Account: admin@jobpickers.com / admin123');
}
main()
    .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
