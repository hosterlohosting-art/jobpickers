import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { Calendar, FileText, ArrowRight, Sparkles, Clock, Search, TrendingUp } from 'lucide-react';
import AdSenseContainer from '../../components/adsense';
import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Career Advice, Resume Tips & Salary Guides 2025 - JobPickers Blog',
  description: 'Expert career guides written by recruiters and hiring managers. Master resume writing, crush technical interviews, negotiate higher salaries, and find your dream job faster.',
  openGraph: {
    title: 'Career Advice & Job Search Guides — JobPickers Blog',
    description: 'Expert career guides: resume writing, interview prep, salary negotiation, remote work, and more. Written by recruiters and industry professionals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobPickers Career Advice Blog',
    description: 'Expert career guides from recruiters and hiring managers.',
  }
};

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').length;
  return Math.max(1, Math.ceil(wordCount / 230));
}

const TOPICS = [
  'Resume Tips', 'Interview Prep', 'Salary Negotiation', 'Remote Work',
  'Career Change', 'Tech Careers', 'Freelancing', 'AI & Tools'
];

const FEATURED_SLUGS = [
  'how-to-write-a-resume-that-gets-interviews',
  'technical-interview-preparation-guide-2025',
  'salary-negotiation-scripts-get-paid-what-youre-worth',
];

export default async function BlogIndexPage() {
  let posts: any[] = [];
  let adTopCode = '';
  let adSidebarCode = '';

  try {
    posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } }
    });

    const adTop = await prisma.adPlacement.findUnique({ where: { name: 'blog_top' } });
    if (adTop && adTop.isActive) adTopCode = adTop.adCode;

    const adSidebar = await prisma.adPlacement.findUnique({ where: { name: 'blog_sidebar' } });
    if (adSidebar && adSidebar.isActive) adSidebarCode = adSidebar.adCode;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  const featuredPosts = posts.filter(p => FEATURED_SLUGS.includes(p.slug));
  const regularPosts = posts.filter(p => !FEATURED_SLUGS.includes(p.slug));
  const heroPost = featuredPosts[0] || posts[0];
  const sideFeatured = featuredPosts.slice(1, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* PAGE HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-3">
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slateText-primary tracking-tight">
          Career Advice & Job Search Guides
        </h1>
        <p className="text-sm text-slateText-muted mt-3 leading-relaxed max-w-xl mx-auto">
          Expert guides from our team of recruiters and hiring managers — helping you write better resumes, ace interviews, negotiate higher salaries, and land your dream job.
        </p>
        {/* Topic Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {TOPICS.map(topic => (
            <span key={topic} className="bg-grayBg border border-grayBorder text-slateText-secondary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Top AdSense slot */}
      <AdSenseContainer placementName="blog_top" adCode={adTopCode} className="max-w-4xl mx-auto mb-10" />

      {/* HERO + SIDE FEATURED */}
      {heroPost && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main hero post */}
          <article className="lg:col-span-2 bg-white border border-grayBorder rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {heroPost.featuredImage && (
              <div className="h-56 overflow-hidden">
                <img src={heroPost.featuredImage} alt={heroPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className={`p-6 ${!heroPost.featuredImage ? 'bg-gradient-to-br from-accent-teal to-accent-green/80' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${heroPost.featuredImage ? 'bg-accent-green/10 text-accent-green' : 'bg-white/20 text-white'}`}>
                  Featured
                </span>
              </div>
              <Link href={`/blog/${heroPost.slug}`}>
                <h2 className={`font-extrabold text-xl md:text-2xl leading-tight hover:underline transition-colors ${heroPost.featuredImage ? 'text-slateText-primary hover:text-accent-green' : 'text-white'}`}>
                  {heroPost.title}
                </h2>
              </Link>
              <p className={`text-sm mt-2 leading-relaxed line-clamp-3 ${heroPost.featuredImage ? 'text-slateText-secondary' : 'text-white/80'}`}>
                {heroPost.excerpt}
              </p>
              <div className={`flex items-center gap-4 text-xs font-semibold mt-4 ${heroPost.featuredImage ? 'text-slateText-muted' : 'text-white/70'}`}>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(heroPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calcReadingTime(heroPost.content)} min read</span>
              </div>
            </div>
          </article>

          {/* Side featured posts */}
          <div className="flex flex-col gap-6">
            {(sideFeatured.length > 0 ? sideFeatured : posts.slice(1, 3)).map((post) => (
              <article key={post.id} className="bg-white border border-grayBorder rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col flex-grow group">
                <div className="inline-block bg-accent-green/10 text-accent-green text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded mb-2 self-start">
                  Must Read
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="font-extrabold text-sm leading-tight text-slateText-primary group-hover:text-accent-green hover:underline transition-colors line-clamp-3">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-xs text-slateText-secondary mt-2 line-clamp-2 leading-relaxed flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 text-[10px] font-semibold text-slateText-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calcReadingTime(post.content)} min</span>
                  <Link href={`/blog/${post.slug}`} className="text-accent-green font-bold hover:underline flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── ALL ARTICLES GRID ── */}
        <main className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-grayBorder pb-3 mb-6">
            <h2 className="text-sm font-extrabold text-slateText-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent-green" />
              All Career Guides ({posts.length})
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {regularPosts.map((post) => (
                <article key={post.id} className="bg-white border border-grayBorder rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group">
                  {post.featuredImage && (
                    <div className="h-40 overflow-hidden border-b border-grayBorder">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slateText-muted uppercase tracking-wider mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="mx-1">·</span>
                      <Clock className="w-3 h-3" />
                      <span>{calcReadingTime(post.content)} min read</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-extrabold text-sm text-slateText-primary group-hover:text-accent-green hover:underline leading-tight transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-slateText-secondary mt-2 line-clamp-3 leading-relaxed flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 pt-3 border-t border-grayBorder/60 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slateText-muted">By {post.author.name}</span>
                      <Link href={`/blog/${post.slug}`} className="text-accent-green hover:text-accent-greenHover flex items-center gap-1 font-bold">
                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}

              {posts.length === 0 && (
                <div className="col-span-2 bg-white border border-grayBorder rounded-xl p-10 text-center text-slateText-muted text-sm font-semibold">
                  No articles yet — check back soon!
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-grayBorder rounded-xl p-10 text-center text-slateText-muted text-sm font-semibold">
              Loading career guides...
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-1 space-y-6">

          {/* Topics */}
          <div className="bg-white border border-grayBorder rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-green" />
              Browse by Topic
            </h2>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(topic => (
                <Link key={topic} href="/blog"
                  className="bg-grayBg border border-grayBorder text-slateText-secondary hover:border-accent-green/50 hover:text-accent-green text-[10px] font-bold px-2.5 py-1 rounded transition-colors">
                  {topic}
                </Link>
              ))}
            </div>
          </div>

          {/* Job search CTA */}
          <div className="bg-accent-teal rounded-xl p-5 text-white shadow-sm">
            <h2 className="font-extrabold text-sm mb-1">Ready to Apply?</h2>
            <p className="text-xs text-white/80 mb-4 leading-relaxed">
              Put your new knowledge to work. Browse real job listings updated daily from the world's top job boards.
            </p>
            <Link href="/jobs" className="block bg-accent-green hover:bg-accent-greenHover text-white text-xs font-extrabold text-center py-2.5 rounded-md transition-colors">
              Browse All Jobs →
            </Link>
          </div>

          {/* Popular posts */}
          <div className="bg-white border border-grayBorder rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3">
              Most Popular
            </h2>
            <div className="space-y-3">
              {posts.slice(0, 6).map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start gap-2.5 group">
                  <span className="text-xl font-extrabold text-grayBorder group-hover:text-accent-green/30 transition-colors flex-shrink-0 leading-tight">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xs font-bold text-slateText-primary group-hover:text-accent-green transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* AdSense */}
          <AdSenseContainer placementName="blog_sidebar" adCode={adSidebarCode} />
        </aside>

      </div>
    </div>
  );
}
