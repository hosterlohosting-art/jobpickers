import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { Calendar, FileText, ArrowRight, Sparkles } from 'lucide-react';
import AdSenseContainer from '../../components/adsense';
import { Metadata } from 'next';

export const revalidate = 7200; // Cache blog list for 2 hours

export const metadata: Metadata = {
  title: 'Career Advice, Resume Tips & Salary Guides - JobPickers',
  description: 'Expert career guides. Learn how to optimize your resume, prepare for coding interviews, negotiate salaries, and find remote developer jobs.'
};

export default async function BlogIndexPage() {
  let posts: any[] = [];
  let adTopCode = '';
  let adSidebarCode = '';
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } }
      }
    });

    const adTop = await prisma.adPlacement.findUnique({ where: { name: 'blog_top' } });
    if (adTop && adTop.isActive) adTopCode = adTop.adCode;

    const adSidebar = await prisma.adPlacement.findUnique({ where: { name: 'blog_sidebar' } });
    if (adSidebar && adSidebar.isActive) adSidebarCode = adSidebar.adCode;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header section */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm mb-8 text-center max-w-3xl mx-auto">
        <div className="w-10 h-10 rounded bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-3">
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="text-xl md:text-3xl font-extrabold text-slateText-primary">
          JobPickers Career Advice
        </h1>
        <p className="text-xs md:text-sm text-slateText-muted mt-2">
          Discover highly helpful guidelines written by our recruiters to help you pass resume screeners, master technical interviews, and negotiate competitive salaries.
        </p>
      </div>

      {/* Top AdSense slot */}
      <AdSenseContainer placementName="blog_top" adCode={adTopCode} className="max-w-3xl mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main listings (Col span 2) */}
        <main className="lg:col-span-2 space-y-6">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white border border-grayBorder rounded-lg overflow-hidden flex flex-col shadow-sm card-hover-effect">
                  {post.featuredImage && (
                    <div className="h-44 overflow-hidden relative border-b border-grayBorder">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slateText-muted uppercase tracking-wider mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-extrabold text-sm md:text-base text-slateText-primary hover:text-accent-green hover:underline leading-tight transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-slateText-secondary mt-2 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slateText-muted">By {post.author.name}</span>
                      <Link href={`/blog/${post.slug}`} className="text-accent-green hover:text-accent-greenHover flex items-center gap-1 font-bold">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-grayBorder rounded-lg p-10 text-center text-slateText-muted">
              No blog articles have been written. Run seed operations to pre-seed career guidelines.
            </div>
          )}
        </main>

        {/* Sidebar Widgets */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-green" />
              <span>Advocacy Topics</span>
            </h2>
            <ul className="space-y-2 text-xs font-semibold text-slateText-secondary">
              <li><Link href="/blog" className="hover:text-accent-green hover:underline">Resume & Cover Letter Tips</Link></li>
              <li><Link href="/blog" className="hover:text-accent-green hover:underline">Technical Interview Guides</Link></li>
              <li><Link href="/blog" className="hover:text-accent-green hover:underline">Salary Negotiation Scenarios</Link></li>
              <li><Link href="/blog" className="hover:text-accent-green hover:underline">Remote Workspace Setups</Link></li>
            </ul>
          </div>

          {/* AdSense Sidebar slot */}
          <AdSenseContainer placementName="blog_sidebar" adCode={adSidebarCode} />
        </aside>

      </div>
    </div>
  );
}
