import { ShieldCheck, Heart, Zap, Users, Search, Globe, Target, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About JobPickers – Our Mission, Story & Team',
  description: 'JobPickers was built to make job search transparent, fast, and trustworthy. Learn about our mission to connect ambitious professionals with top remote-first employers globally.',
};

const stats = [
  { value: '500+', label: 'Jobs Listed Daily' },
  { value: '50+', label: 'Countries Covered' },
  { value: '8', label: 'Job Categories' },
  { value: '100%', label: 'Free for Job Seekers' },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Radical Transparency',
    desc: 'Every job listing on JobPickers is attributed to its original source. We never fabricate company reviews, inflate salary data, or hide application links behind paywalls. If we list it, you can verify it.',
  },
  {
    icon: Zap,
    title: 'Speed First',
    desc: "Job searching is stressful enough without slow websites. We obsess over Core Web Vitals — our pages load in under 1 second on most connections. Your time matters.",
  },
  {
    icon: Search,
    title: 'Smart Filtering',
    desc: 'Our automated pipeline uses AI-powered tagging to correctly categorize jobs by skill, seniority, remote policy, and industry. No more "Software Engineer" jobs buried under unrelated noise.',
  },
  {
    icon: Globe,
    title: 'Global & Remote Focus',
    desc: 'We specifically index remote-friendly and international employers — the companies many talented professionals in Europe, LATAM, and Asia-Pacific struggle to discover.',
  },
];

const team = [
  {
    name: 'The JobPickers Team',
    role: 'Builders & Operators',
    bio: 'A small team passionate about building useful products for job seekers. We operate lean, ship fast, and listen to our users.',
    initials: 'JP',
  },
];

const howItWorks = [
  { step: '1', title: 'We Ingest', desc: 'Our crawlers pull fresh job listings from public APIs and RSS feeds from top employers and platforms daily.' },
  { step: '2', title: 'We Filter', desc: 'AI models and rule-based filters remove duplicates, spam, and expired listings — keeping only legitimate, active roles.' },
  { step: '3', title: 'We Categorize', desc: 'Each job is automatically tagged with category, seniority level, skills, and remote policy for accurate search results.' },
  { step: '4', title: 'You Apply', desc: 'We link directly to the original job posting. No middlemen, no sign-up walls, no resume scraping.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

      {/* Hero Header */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 md:p-12 shadow-sm text-center">
        <div className="w-14 h-14 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-4">
          <Heart className="w-7 h-7" />
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slateText-primary mb-4 leading-tight">
          We Built the Job Board We Wished Existed
        </h1>
        <p className="text-sm md:text-base text-slateText-secondary max-w-2xl mx-auto leading-relaxed">
          JobPickers was born out of frustration with job boards full of spam, ghost listings, and hidden application fees. 
          We set out to build something genuinely useful — a fast, transparent, and always-free tool for real job seekers.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/jobs" className="bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-2.5 rounded text-sm transition-colors shadow-sm">
            Browse Jobs
          </Link>
          <Link href="/contact" className="border border-grayBorder/40 text-slateText-primary hover:border-accent-green font-bold px-6 py-2.5 rounded text-sm transition-colors">
            Get in Touch
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 text-center shadow-sm">
            <div className="text-2xl md:text-3xl font-extrabold text-accent-green">{stat.value}</div>
            <div className="text-xs font-bold text-slateText-muted uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slateText-primary mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-green" />
          Our Story
        </h2>
        <div className="space-y-4 text-sm text-slateText-secondary leading-relaxed">
          <p>
            JobPickers launched in 2026 after noticing a persistent gap in the job search market: most aggregators 
            either showed thousands of irrelevant results, hid application links behind login walls, or were saturated 
            with sponsored postings that buried organic listings.
          </p>
          <p>
            Our approach is different. We focus on <strong className="text-slateText-primary">quality over quantity</strong> — 
            ingesting from verified sources, applying automated duplicate-detection, and using AI-powered tagging to 
            categorize roles accurately. Every listing includes a direct link to the original employer page.
          </p>
          <p>
            We're particularly focused on helping professionals in <strong className="text-slateText-primary">Europe, LATAM, 
            and Asia-Pacific</strong> discover remote-first companies that are actively building globally distributed teams. 
            Geographic arbitrage is real — and talented developers, designers, and marketers everywhere deserve access 
            to the same opportunities.
          </p>
          <p>
            We're building in public, starting lean, and improving daily. If you have feedback or want to partner with us, 
            we'd love to hear from you.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slateText-primary mb-6">How JobPickers Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {howItWorks.map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-green text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-slateText-primary text-sm">{item.title}</h3>
                <p className="text-xs text-slateText-secondary mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slateText-primary mb-6">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green flex-shrink-0">
                <v.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slateText-primary text-sm">{v.title}</h3>
                <p className="text-xs text-slateText-secondary mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slateText-primary mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-green" />
          The Team
        </h2>
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-accent-green text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">
            JP
          </div>
          <div>
            <h3 className="font-extrabold text-slateText-primary">The JobPickers Team</h3>
            <p className="text-xs text-accent-green font-bold uppercase tracking-wider mb-2">Builders & Operators</p>
            <p className="text-sm text-slateText-secondary leading-relaxed">
              A small, focused team passionate about building genuinely useful products. We believe the best tools 
              are the ones that solve a real problem without adding friction. We operate lean, ship frequently, 
              and put user needs first. Got a feature request or spotted a bug? We read every message.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slateText-primary mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-green" />
          Trust & Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'GDPR & CCPA compliant data practices',
            'All listings attributed to original source',
            'No resume scraping or data selling',
            'Direct employer apply links — no middlemen',
            'Spam and duplicate filtering on every import',
            'DMCA takedown process in place',
            'AdSense compliant — no thin or copied content',
            'SSL secured — all connections encrypted',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slateText-secondary">
              <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-accent-green rounded-lg p-8 text-center text-white">
        <Mail className="w-8 h-8 mx-auto mb-3 opacity-80" />
        <h2 className="text-xl font-extrabold mb-2">Want to Work Together?</h2>
        <p className="text-sm text-white/80 mb-5 max-w-md mx-auto">
          Interested in advertising, data partnerships, or employer listings? We're always open to meaningful collaborations.
        </p>
        <Link href="/contact" className="bg-white text-accent-green font-extrabold px-8 py-3 rounded text-sm hover:bg-white/90 transition-colors shadow-sm inline-block">
          Contact Us
        </Link>
      </div>

    </div>
  );
}
