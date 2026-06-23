import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { Calendar, User, ArrowLeft, BookOpen, Clock, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import AdSenseContainer from '../../../components/adsense';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Estimate reading time from HTML content
function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').length;
  return Math.max(1, Math.ceil(wordCount / 230)); // avg adult reading speed
}

// Extract H2 headings for Table of Contents
function extractHeadings(html: string): { id: string; text: string }[] {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    headings.push({ id, text });
  }
  return headings;
}

// Inject IDs into H2 tags for anchor linking
function injectHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_, attrs, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<h2${attrs} id="${id}">${text}</h2>`;
  });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } }
  });
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobpickers.com';

  return {
    title: post.metaTitle || `${post.title} - JobPickers Career Advice`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      siteName: 'JobPickers'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`
    }
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true } }
    }
  });

  if (!post) {
    notFound();
  }

  // Fetch related posts and ad placements
  let relatedPosts: any[] = [];
  let adInContentCode = '';
  let adSidebarCode = '';
  try {
    relatedPosts = await prisma.blogPost.findMany({
      where: { status: 'published', NOT: { id: post.id } },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const adInContent = await prisma.adPlacement.findUnique({ where: { name: 'blog_in_content' } });
    if (adInContent && adInContent.isActive) adInContentCode = adInContent.adCode;

    const adSidebar = await prisma.adPlacement.findUnique({ where: { name: 'blog_sidebar' } });
    if (adSidebar && adSidebar.isActive) adSidebarCode = adSidebar.adCode;
  } catch (error) {
    console.error('Error fetching related posts:', error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobpickers.com';
  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const readingTime = calcReadingTime(post.content);
  const tocHeadings = extractHeadings(post.content);
  const contentWithIds = injectHeadingIds(post.content);

  // Article JSON-LD structured data (boosts Google Search appearance)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author.name
    },
    publisher: {
      '@type': 'Organization',
      name: 'JobPickers',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    ...(post.featuredImage && { image: post.featuredImage })
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Career Advice', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Structured Data injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb nav */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slateText-muted mb-6">
        <Link href="/" className="hover:text-accent-green transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-accent-green transition-colors">Career Advice</Link>
        <span>/</span>
        <span className="text-slateText-primary truncate max-w-xs">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── MAIN ARTICLE COLUMN ── */}
        <article className="lg:col-span-2 space-y-6">
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg overflow-hidden shadow-sm">

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Category tag */}
              <div className="inline-block bg-accent-green/10 text-accent-green text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded mb-4">
                Career Advice
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-slateText-primary leading-tight mb-4">
                {post.title}
              </h1>

              {/* Excerpt / lede */}
              <p className="text-sm md:text-base text-slateText-secondary leading-relaxed border-l-4 border-accent-green pl-4 py-1 bg-accent-green/[0.03] rounded-r-md mb-6">
                {post.excerpt}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slateText-muted border-b border-grayBorder/40 pb-5 mb-6">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent-green" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-green" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-green" />
                  {readingTime} min read
                </span>
              </div>

              {/* Table of Contents */}
              {tocHeadings.length > 2 && (
                <nav className="bg-grayBg/60 border border-grayBorder/40 rounded-lg p-5 mb-8">
                  <h2 className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent-green" />
                    Table of Contents
                  </h2>
                  <ol className="space-y-1.5">
                    {tocHeadings.map((h, i) => (
                      <li key={h.id} className="text-xs">
                        <a
                          href={`#${h.id}`}
                          className="text-slateText-secondary hover:text-accent-green transition-colors font-semibold flex items-start gap-2"
                        >
                          <span className="text-accent-green font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                          <span>{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* In-content AdSense slot */}
              <AdSenseContainer placementName="blog_in_content" adCode={adInContentCode} className="mb-8" />

              {/* Article body */}
              <div
                className="prose prose-sm max-w-none text-slateText-secondary leading-relaxed
                  prose-h2:text-slateText-primary prose-h2:font-extrabold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pt-2 prose-h2:border-t prose-h2:border-grayBorder/40
                  prose-h3:text-slateText-primary prose-h3:font-bold prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                  prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4
                  prose-a:text-accent-green prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slateText-primary prose-strong:font-extrabold
                  prose-blockquote:border-accent-green prose-blockquote:bg-accent-green/[0.03] prose-blockquote:rounded-r-md prose-blockquote:py-1
                  prose-li:mb-1
                  "
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Social share buttons */}
              <div className="border-t border-grayBorder/40 mt-10 pt-6">
                <p className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-accent-green" />
                  Share this article
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 px-3 py-2 rounded-md text-xs font-bold transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 px-3 py-2 rounded-md text-xs font-bold transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/30 px-3 py-2 rounded-md text-xs font-bold transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Author bio box */}
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green font-extrabold text-xl flex-shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slateText-primary">{post.author.name}</h3>
              <p className="text-xs text-slateText-muted mt-0.5 font-semibold">Career Advice Editor, JobPickers</p>
              <p className="text-xs text-slateText-secondary mt-2 leading-relaxed">
                The JobPickers editorial team comprises experienced recruiters, hiring managers, and career coaches. Our mission is to provide actionable, data-driven career advice that helps job seekers at every stage land their next role faster.
              </p>
            </div>
          </div>
        </article>

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-1 space-y-6">

          {/* Back link */}
          <Link href="/blog" className="flex items-center gap-1.5 text-xs font-bold text-slateText-secondary hover:text-accent-green transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all articles
          </Link>

          {/* Related articles */}
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm">
            <h2 className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider border-b border-grayBorder/40 pb-3 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-green" />
              More Career Guides
            </h2>
            <div className="space-y-4">
              {relatedPosts.map((relPost) => (
                <div key={relPost.id} className="group border-b border-grayBorder/40 pb-4 last:border-0 last:pb-0">
                  <Link href={`/blog/${relPost.slug}`}>
                    <h3 className="text-xs font-bold text-slateText-primary group-hover:text-accent-green leading-snug transition-colors line-clamp-2">
                      {relPost.title}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-slateText-muted mt-1 uppercase font-semibold tracking-wide">
                    {new Date(relPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick job search CTA */}
          <div className="bg-accent-teal text-white rounded-lg p-5 shadow-sm">
            <h2 className="font-extrabold text-sm mb-2">Ready to Apply?</h2>
            <p className="text-xs text-white/80 mb-4 leading-relaxed">Browse thousands of real jobs from top employers — updated daily from Remotive, Arbeitnow, and more.</p>
            <Link
              href="/jobs"
              className="block w-full bg-accent-green hover:bg-accent-greenHover text-white text-xs font-extrabold text-center py-2.5 rounded-md transition-colors"
            >
              Browse All Jobs →
            </Link>
          </div>

          {/* Categories */}
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm">
            <h2 className="text-xs font-extrabold text-slateText-primary uppercase tracking-wider border-b border-grayBorder/40 pb-2 mb-3">
              Browse by Topic
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Resume Tips', 'Interviews', 'Salary', 'Remote Work', 'Career Change', 'Tech Jobs', 'Freelancing', 'AI Tools'].map((tag) => (
                <Link
                  key={tag}
                  href="/blog"
                  className="bg-grayBg/60 border border-grayBorder/40 text-slateText-secondary hover:border-accent-green/50 hover:text-accent-green text-[10px] font-bold px-2.5 py-1 rounded transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* AdSense Sidebar slot */}
          <AdSenseContainer placementName="blog_sidebar" adCode={adSidebarCode} />
        </aside>

      </div>
    </div>
  );
}
