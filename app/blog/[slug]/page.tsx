import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';
import AdSenseContainer from '../../../components/adsense';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug }
  });
  if (!post) return {};
  return {
    title: `${post.title} - JobPickers Career Advice`,
    description: post.excerpt
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

  // Fetch other blog posts, and ad placements
  let relatedPosts: any[] = [];
  let adInContentCode = '';
  let adSidebarCode = '';
  try {
    relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        NOT: { id: post.id }
      },
      take: 2,
      orderBy: { createdAt: 'desc' }
    });

    const adInContent = await prisma.adPlacement.findUnique({ where: { name: 'blog_in_content' } });
    if (adInContent && adInContent.isActive) adInContentCode = adInContent.adCode;

    const adSidebar = await prisma.adPlacement.findUnique({ where: { name: 'blog_sidebar' } });
    if (adSidebar && adSidebar.isActive) adSidebarCode = adSidebar.adCode;
  } catch (error) {
    console.error('Error fetching related posts:', error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <Link href="/blog" className="flex items-center gap-1.5 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to blog advice
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Article column */}
        <article className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slateText-muted border-b border-grayBorder/60 pb-3 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slateText-muted" />{new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4 text-slateText-muted" />By {post.author.name}</span>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-slateText-primary leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-xs md:text-sm text-slateText-muted font-semibold italic border-l-2 border-accent-green pl-3 py-1 bg-grayBg mb-6">
              {post.excerpt}
            </p>

            {post.featuredImage && (
              <div className="w-full h-64 md:h-80 overflow-hidden rounded-md border border-grayBorder mb-6">
                <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* In-content AdSense slot */}
            <AdSenseContainer placementName="blog_in_content" adCode={adInContentCode} className="mb-6" />

            {/* Content html body */}
            <div 
              className="prose prose-sm max-w-none text-slateText-secondary leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Sidebar recommendations */}
        <aside className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border border-grayBorder rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-green" />
              <span>Recommended Reading</span>
            </h2>
            {relatedPosts.length > 0 ? (
              <div className="space-y-3.5">
                {relatedPosts.map((relPost) => (
                  <div key={relPost.id} className="group">
                    <Link href={`/blog/${relPost.slug}`}>
                      <h3 className="text-xs font-bold text-slateText-primary group-hover:text-accent-green leading-snug line-clamp-2">
                        {relPost.title}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-slateText-muted mt-1 uppercase font-semibold">
                      {new Date(relPost.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slateText-muted">No related posts at this time.</p>
            )}
          </div>

          {/* AdSense Sidebar slot */}
          <AdSenseContainer placementName="blog_sidebar" adCode={adSidebarCode} />
        </aside>

      </div>
    </div>
  );
}
