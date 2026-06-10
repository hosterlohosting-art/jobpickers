# JobPickers - Premium Job Portal Aggregator

JobPickers is a production-ready, light-themed job portal inspired by Glassdoor and Indeed. It is designed to automatically aggregate, normalize, clean, and expire job listings, while being optimized for Google AdSense monetization and Google Jobs search engine indexing.

---

## Key Features

1. **Light & Premium Aesthetic**: Harmonious light-gray styling (`#F7F8FA` background, `#FFFFFF` cards) with bright emerald green accents (`#0CAA41`) and dark teal header panels.
2. **Automated Sourcing Pipeline**:
   - **RSS Feed Sync**: Actively pulls remote job listings from public APIs (Remotive and Arbeitnow) with no authentication required.
   - **Mock API Connectors**: Configured for Indeed Partner Feed, LinkedIn Jobs API, and Glassdoor API. Skips crawling with warnings if API keys are not provided.
   - **Manual Connector**: Receives employer checkout requests.
3. **AI Normalizer Layer (`lib/ai.ts`)**:
   - Standardizes job titles (e.g. "Sr." to "Senior").
   - Categorizes postings into one of the 8 JobPickers categories.
   - Automatically extracts technical and professional skills.
   - Run spam detection heuristics and holds suspicious listings for review.
   - Seamlessly integrates with OpenAI API if `OPENAI_API_KEY` is provided; falls back to local rules-based regex engine if keys are absent.
4. **Duplicate Detection Engine**:
   - **Strict check**: Prevents identical `title` + `company` + `location` + `applyUrl` entries.
   - **Fuzzy check**: Matches similar titles under the same company within 7 days, updating original dates and extending expiry instead of inserting clutter.
5. **Lifespan Manager**: Auto-expires listings after 30 days and archives older database jobs (after 60 days) to keep database sizes minimal.
6. **Monetization Engine**: Uses configurable Google AdSense slots (Homepage banners, Jobs feed sidebars, Job Details summary inserts, Blog post columns, Global footer). Toggled and updated live from the Admin Panel.
7. **Value-Add Seeker Services**: ATS Resume Keyword Optimization Auditor directly inside the job seeker dashboard.
8. **SEO & Rich Schemas**: Injects Schema.org `JobPosting` JSON-LD structured metadata automatically on detail views to index jobs natively in Google Jobs.

---

## Folder Architecture

```
d:/jOBpICKERS/
├── prisma/
│   ├── schema.prisma         # SQLite database schema models
│   └── seed.ts               # Database seeder (creates users, ads, and blogs)
├── lib/
│   ├── prisma.ts             # Prisma Client singleton
│   ├── ai.ts                 # AI enrichment & local regex fallback normalizer
│   └── connectors/
│       ├── connector.ts      # TypeScript interfaces for connectors
│       ├── indeed.ts         # Mock connector for Indeed
│       ├── linkedin.ts       # Mock connector for LinkedIn
│       ├── glassdoor.ts      # Mock connector for Glassdoor
│       ├── rss.ts            # RSS live feed connector (Remotive & Arbeitnow)
│       └── manual.ts         # Manual postings parser
├── app/
│   ├── layout.tsx            # Main layout and Google Fonts integration
│   ├── page.tsx              # Homepage with visual search cards
│   ├── jobs/
│   │   ├── page.tsx          # Jobs search and filter sidebar
│   │   ├── [slug]/page.tsx   # SSR details page with JSON-LD schema
│   │   ├── location/[city]/  # Location specific landing pages
│   │   └── category/[cat]/   # Category landing pages
│   ├── companies/[slug]/     # Company profiles and vacancy listings
│   ├── blog/                 # Careers Advice Index and articles details
│   ├── dashboard/            # Seeker dashboard & ATS Resume Keywords Auditor
│   ├── employer/             # Post-a-job submission form
│   ├── admin/                # Administrator dashboard panel
│   └── api/
│       ├── admin/route.ts    # Setting updates API
│       ├── employer/route.ts # Employer post publishing API
│       ├── jobs/
│       │   ├── apply/route.ts # Click tracking redirect endpoint
│       │   └── import/route.ts # Daily sync crawling pipeline
│       └── auth/             # Custom dashboard simulations
├── components/
│   ├── navbar.tsx            # Navigation header
│   ├── footer.tsx            # Footer newsletter layout
│   ├── adsense.tsx           # AdSense script block renderers
│   └── job-card.tsx          # Shared search layout card
├── package.json              # Dependencies and compilation configs
└── tailwind.config.js        # Green aesthetic colors design systems tokens
```

---

## Installation & Setup

### 1. Configure Secrets
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
DATABASE_URL="file:./dev.db"
# (Optional) Provide your OpenAI API key for AI enrichment
OPENAI_API_KEY="your-openai-api-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Push Database Schema
Apply the schema structure to your local SQLite file:
```bash
npx prisma db push
```

### 4. Seed Database
Seed initial mock administrators, companies, blogs, and AdSense placement records:
```bash
npm run prisma:seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## System Integration APIs

### 1. Ingestion Crawling Cron (`POST /api/jobs/import`)
To trigger the automated job import crawling loop (e.g. from a daily Vercel Cron or GitHub Action):
- Send a `POST` request to `/api/jobs/import`
- For manual syncs, send a body: `{"sourceId": "source-uuid"}` to sync that single provider.

### 2. Vacancy Click Redirection (`GET /api/jobs/apply?id=<job-id>`)
Tracks click statistics before forwarding seekers to company applications. Accessible directly from the job detail view.

---

## Production Deployment (Vercel & PostgreSQL)

To deploy the codebase to a production cloud server (e.g. Vercel) using an enterprise database provider (e.g. Neon PostgreSQL):

1. **Modify `prisma/schema.prisma`**:
   Change the datasource block provider from `"sqlite"` to `"postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Commit Changes**: Push the codebase to your GitHub repository.
3. **Create Vercel Project**: Link the repo and set the `DATABASE_URL` environment secret matching your Neon/PostgreSQL connection string.
4. **Vercel Builds**: During compilation, Vercel will run `prisma generate` natively and apply schema mappings, with no local Node setup required.
