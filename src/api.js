// JOBPICKERS.COM API INTEGRATION SERVICE

// 1. High-Value Preloaded/Mock Jobs Database
// This ensures instant board population with attractive listings even if client-side CORS issues occur
const PRELOADED_JOBS = [
  {
    id: "jp-mock-1",
    title: "Senior Full Stack Engineer (React & Node)",
    company: "Stripe",
    company_logo: "",
    company_url: "https://stripe.com",
    category: "software-development",
    type: "full-time",
    policy: "remote",
    location: "San Francisco, CA (Remote)",
    salary_min: 140000,
    salary_max: 185000,
    description: `
      <h3>About Stripe</h3>
      <p>Stripe is a financial infrastructure platform for the internet. Millions of businesses—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.</p>
      
      <h3>The Role</h3>
      <p>We are looking for a Senior Full Stack Engineer to join our Core Billing team. In this role, you will design, build, and maintain APIs, services, and user interfaces that power Stripe Billing, which processes billions of dollars in recurring transactions yearly.</p>
      
      <h3>Responsibilities</h3>
      <ul>
        <li>Build developer-facing APIs and dashboards that are clean, modular, and extremely performant.</li>
        <li>Collaborate with product designers and product managers to define financial dashboard interfaces.</li>
        <li>Optimize data pipelines and database queries to ensure millisecond-level responsiveness globally.</li>
        <li>Mentor junior and mid-level engineers in building robust engineering patterns.</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>5+ years of experience building scalable production web applications.</li>
        <li>Expert level skill in JavaScript/TypeScript, React, Node.js, and SQL databases.</li>
        <li>Strong understanding of API design principles and REST/GraphQL patterns.</li>
        <li>Outstanding communication skills and customer-centric design values.</li>
      </ul>
      
      <h3>Benefits</h3>
      <ul>
        <li>Highly competitive salary + equity packages.</li>
        <li>Comprehensive healthcare coverage (medical, dental, vision).</li>
        <li>Generous wellness, home office, and learning allowances.</li>
        <li>Unlimited Paid Time Off (PTO).</li>
      </ul>
    `,
    apply_url: "https://stripe.com/jobs",
    date_posted: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    featured: true
  },
  {
    id: "jp-mock-2",
    title: "Lead UI/UX Designer - Next-Gen UI",
    company: "Vercel",
    company_logo: "",
    company_url: "https://vercel.com",
    category: "design",
    type: "full-time",
    policy: "remote",
    location: "New York, NY (Remote)",
    salary_min: 130000,
    salary_max: 165000,
    description: `
      <h3>About Vercel</h3>
      <p>Vercel provides the developer experience and infrastructure to build, deploy, and scale the frontend web. We empower creators to build faster, more collaborative, and highly performant digital applications.</p>
      
      <h3>The Role</h3>
      <p>We are seeking a Lead Product Designer to shape the future of Vercel v0, our AI UI generator, and the Vercel Dashboard. You will design elegant workspaces, complex developer tools, and clean layout patterns that make coding visual, intuitive, and extremely satisfying.</p>
      
      <h3>Key Duties</h3>
      <ul>
        <li>Lead design sprints for next-generation developer workflow systems.</li>
        <li>Maintain, expand, and enforce Vercel's design token system (Geist).</li>
        <li>Build micro-animations, interactives, and gorgeous mockups to showcase product ideas.</li>
        <li>Gather feedback directly from developers, open-source maintainers, and community leaders.</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>4+ years of UX/UI product design experience, specifically in developer tools or B2B SaaS.</li>
        <li>An exceptional portfolio demonstrating interactive dashboards, visual grids, and advanced design systems.</li>
        <li>Expertise in Figma, vector drawings, and advanced prototyping.</li>
        <li>Basic knowledge of React/HTML/CSS is highly preferred to align with implementation squads.</li>
      </ul>
    `,
    apply_url: "https://vercel.com/careers",
    date_posted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    featured: true
  },
  {
    id: "jp-mock-3",
    title: "Senior Product Manager - Cloud Infrastructure",
    company: "Google",
    company_logo: "",
    company_url: "https://google.com",
    category: "product",
    type: "full-time",
    policy: "hybrid",
    location: "Seattle, WA",
    salary_min: 160000,
    salary_max: 220000,
    description: `
      <h3>Role Description</h3>
      <p>As a Senior Product Manager in Google Cloud, you will guide engineering squads to design, develop, and launch high-performance database engines and serverless technologies. You will bridge market needs, developer pain points, and core algorithmic solutions to deliver world-class infrastructure.</p>
      
      <h3>Required Qualifications</h3>
      <ul>
        <li>BS/MS in Computer Science, engineering field, or equivalent experience.</li>
        <li>6+ years of Product Management experience directing SaaS products.</li>
        <li>In-depth familiarity with cloud architectures, databases (SQL/NoSQL), and serverless paradigms.</li>
      </ul>
    `,
    apply_url: "https://careers.google.com",
    date_posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    featured: false
  },
  {
    id: "jp-mock-4",
    title: "Senior Growth Marketing Manager",
    company: "Shopify",
    company_logo: "",
    company_url: "https://shopify.com",
    category: "marketing",
    type: "full-time",
    policy: "remote",
    location: "Toronto, ON (Remote)",
    salary_min: 95000,
    salary_max: 130000,
    description: `
      <h3>About Shopify</h3>
      <p>Shopify is a leading global commerce company, providing trusted tools for starting, growing, marketing, and managing retail businesses of any size. Millions of merchants in more than 175 countries trust Shopify to power their brands.</p>
      
      <h3>The Role</h3>
      <p>We are seeking a data-driven Growth Marketer to lead customer acquisition strategies for Shopify Plus. You will run targeted lead generation campaigns, optimize search marketing channels, and coordinate multi-channel retention frameworks to scale enterprise sign-ups.</p>
      
      <h3>Skills Needed</h3>
      <ul>
        <li>5+ years of digital marketing experience in B2B SaaS environments.</li>
        <li>Expertise in SEO, Google Ads, LinkedIn Ads, and marketing funnels.</li>
        <li>Proficiency in analytics tools (GA4, Looker) to monitor conversion rates and client acquisition costs.</li>
      </ul>
    `,
    apply_url: "https://shopify.com/careers",
    date_posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    featured: false
  },
  {
    id: "jp-mock-5",
    title: "Support Operations Engineer",
    company: "GitHub",
    company_logo: "",
    company_url: "https://github.com",
    category: "customer-support",
    type: "full-time",
    policy: "remote",
    location: "Global Remote",
    salary_min: 75000,
    salary_max: 105000,
    description: `
      <h3>Role Description</h3>
      <p>GitHub is looking for a Support Operations Engineer to build, scale, and optimize the tools our support staff use to resolve issues for 100+ million developers. You will maintain ticket management systems, design bot automation, and integrate support APIs.</p>
      
      <h3>Requirements</h3>
      <ul>
        <li>Experience supporting developers or working with developer APIs.</li>
        <li>Proficiency in Ruby on Rails, JavaScript, or Python.</li>
        <li>Strong knowledge of Git, GitHub workflows, and CI/CD pipelines.</li>
      </ul>
    `,
    apply_url: "https://github.com/about/careers",
    date_posted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: "jp-mock-6",
    title: "Senior Legal Counsel - Intellectual Property",
    company: "Netflix",
    company_logo: "",
    company_url: "https://netflix.com",
    category: "finance-legal",
    type: "full-time",
    policy: "onsite",
    location: "Los Angeles, CA",
    salary_min: 180000,
    salary_max: 260000,
    description: `
      <h3>The Opportunity</h3>
      <p>Netflix is looking for an intellectual property attorney to join our studio legal affairs squad. You will manage trademarks, copyright clearances, and production licensing agreements for original contents globally.</p>
      
      <h3>Requirements</h3>
      <ul>
        <li>J.D. degree and active membership in California Bar (or equivalent).</li>
        <li>8+ years of IP transactional legal experience at a top law firm or entertainment company.</li>
      </ul>
    `,
    apply_url: "https://jobs.netflix.com",
    date_posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: "jp-mock-7",
    title: "Junior Frontend Engineer (React/HTML)",
    company: "Canva",
    company_logo: "",
    company_url: "https://canva.com",
    category: "software-development",
    type: "internship",
    policy: "hybrid",
    location: "Sydney, Australia",
    salary_min: 50000,
    salary_max: 70000,
    description: `
      <h3>About Canva</h3>
      <p>Canva is a free-to-use online graphic design tool. Our mission is to empower everyone in the world to design anything and publish anywhere.</p>
      
      <h3>The Role</h3>
      <p>We are seeking a passionate Junior Developer for a 6-month paid internship. You will work within our Editor team, writing clean React components and refining UI animations that impact over 100 million active monthly users.</p>
      
      <h3>Requirements</h3>
      <ul>
        <li>Strong fundamentals in JavaScript, HTML5, CSS3, and React.</li>
        <li>Familiarity with responsive web layout structures and web standards.</li>
        <li>Great enthusiasm for designing beautiful, accessible, and interactive user experiences.</li>
      </ul>
    `,
    apply_url: "https://canva.com/careers",
    date_posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  }
];

// Helper to normalize api categories to match JobPickers categories
function normalizeCategory(apiCategory) {
  if (!apiCategory) return "software-development";
  const cat = apiCategory.toLowerCase();
  
  if (cat.includes("dev") || cat.includes("software") || cat.includes("engineer") || cat.includes("tech") || cat.includes("program")) {
    return "software-development";
  }
  if (cat.includes("design") || cat.includes("ux") || cat.includes("ui") || cat.includes("creative") || cat.includes("artist")) {
    return "design";
  }
  if (cat.includes("market") || cat.includes("sale") || cat.includes("growth") || cat.includes("seo")) {
    return "marketing";
  }
  if (cat.includes("support") || cat.includes("customer") || cat.includes("service") || cat.includes("help")) {
    return "customer-support";
  }
  if (cat.includes("product") || cat.includes("project") || cat.includes("manager") || cat.includes("scrum")) {
    return "product";
  }
  if (cat.includes("legal") || cat.includes("finance") || cat.includes("law") || cat.includes("tax") || cat.includes("account")) {
    return "finance-legal";
  }
  
  return "software-development"; // Default
}

// 2. Fetch Live Jobs from Remotive API
async function fetchRemotiveJobs() {
  try {
    // Attempt live fetch
    const response = await fetch("https://remotive.com/api/remote-jobs?limit=30");
    if (!response.ok) throw new Error("Remotive fetch failed");
    
    const data = await response.json();
    if (!data.jobs || !Array.isArray(data.jobs)) return [];
    
    return data.jobs.map(job => {
      // Estimate salaries as Remotive often returns string descriptions
      let salaryMin = 0;
      let salaryMax = 0;
      if (job.salary) {
        const matches = job.salary.match(/\d+k/g);
        if (matches && matches.length >= 2) {
          salaryMin = parseInt(matches[0]) * 1000;
          salaryMax = parseInt(matches[1]) * 1000;
        } else if (matches && matches.length === 1) {
          salaryMin = parseInt(matches[0]) * 1000;
          salaryMax = salaryMin + 30000;
        }
      }
      if (salaryMin === 0) {
        // Assign realistic estimations for demonstration/sorting
        salaryMin = 80000 + (Math.floor(Math.random() * 8) * 10000);
        salaryMax = salaryMin + 30000;
      }
      
      return {
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        company_logo: job.company_logo || "",
        company_url: "",
        category: normalizeCategory(job.category),
        type: job.job_type ? job.job_type.toLowerCase() : "full-time",
        policy: "remote",
        location: job.candidate_required_location || "Remote",
        salary_min: salaryMin,
        salary_max: salaryMax,
        description: job.description,
        apply_url: job.url,
        date_posted: job.publication_date || new Date().toISOString(),
        featured: false
      };
    });
  } catch (error) {
    console.warn("Could not fetch jobs directly from Remotive due to CORS or network error:", error);
    return [];
  }
}

// 3. Fetch Live Jobs from Arbeitnow API
async function fetchArbeitnowJobs() {
  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api");
    if (!response.ok) throw new Error("Arbeitnow fetch failed");
    
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((job, idx) => {
      // Estimate random salary bounds for filtering
      const salaryMin = 70000 + (Math.floor(Math.random() * 6) * 10000);
      const salaryMax = salaryMin + 25000;
      
      return {
        id: `arbeitnow-${idx}-${job.slug}`,
        title: job.title,
        company: job.company_name,
        company_logo: "",
        company_url: "",
        category: normalizeCategory(job.tags ? job.tags[0] : ""),
        type: job.job_types ? job.job_types[0] : "full-time",
        policy: job.remote ? "remote" : "hybrid",
        location: job.location || "Germany",
        salary_min: salaryMin,
        salary_max: salaryMax,
        description: job.description || `<p>Please visit the application page to read more about this listing.</p>`,
        apply_url: job.url,
        date_posted: new Date().toISOString(), // APIs return current
        featured: false
      };
    });
  } catch (error) {
    console.warn("Could not fetch jobs directly from Arbeitnow due to CORS or network error:", error);
    return [];
  }
}

// 4. Combined Fetching Strategy
export async function getJobs(customListings = []) {
  // Try fetching API boards in parallel
  const [remotiveJobs, arbeitnowJobs] = await Promise.all([
    fetchRemotiveJobs(),
    fetchArbeitnowJobs()
  ]);
  
  // Combine all lists:
  // 1. Custom employer postings (featured)
  // 2. High-value preloaded tech listings
  // 3. Live API listings from Remotive
  // 4. Live API listings from Arbeitnow
  let allJobs = [...customListings, ...PRELOADED_JOBS, ...remotiveJobs, ...arbeitnowJobs];
  
  // Remove duplicates based on title and company
  const seen = new Set();
  allJobs = allJobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return allJobs;
}
