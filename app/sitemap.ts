import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache sitemap on server for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobpickers.com';
  const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  // 1. Static Routes (highest priority pages)
  const staticRoutes = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/jobs', priority: 0.95, freq: 'hourly' as const },
    { path: '/remote-jobs', priority: 0.90, freq: 'daily' as const },
    { path: '/blog', priority: 0.85, freq: 'daily' as const },
    { path: '/companies', priority: 0.80, freq: 'daily' as const },
    { path: '/salaries', priority: 0.75, freq: 'weekly' as const },
    { path: '/employer', priority: 0.70, freq: 'weekly' as const },
    { path: '/about', priority: 0.60, freq: 'monthly' as const },
    { path: '/contact', priority: 0.50, freq: 'monthly' as const },
    { path: '/privacy', priority: 0.30, freq: 'monthly' as const },
    { path: '/terms', priority: 0.30, freq: 'monthly' as const },
    { path: '/cookies', priority: 0.30, freq: 'monthly' as const },
    { path: '/dmca', priority: 0.30, freq: 'monthly' as const },
    { path: '/editorial', priority: 0.40, freq: 'monthly' as const },
  ].map(({ path, priority, freq }) => ({
    url: `${cleanSiteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  // 2. Category pages (programmatic SEO — high value)
  const categories = ['Software', 'Design', 'Marketing', 'Customer Support', 'Finance', 'Sales', 'Data', 'HR'];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${cleanSiteUrl}/jobs?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // 3. Dynamic Blog Routes (high SEO value — boost to 0.85)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = blogs.map((blog) => ({
      url: `${cleanSiteUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85, // Boosted — blog posts are SEO gold
    }));
  } catch (error) {
    console.error('Sitemap blogs fetch error:', error);
  }

  // 4. Dynamic Jobs Routes (most numerous, medium priority)
  let jobsRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    });
    jobsRoutes = jobs.map((job) => ({
      url: `${cleanSiteUrl}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.70,
    }));
  } catch (error) {
    console.error('Sitemap jobs fetch error:', error);
  }

  // 5. Dynamic Companies Routes
  let companiesRoutes: MetadataRoute.Sitemap = [];
  try {
    const companies = await prisma.company.findMany({
      select: { slug: true, updatedAt: true },
    });
    companiesRoutes = companies.map((company) => ({
      url: `${cleanSiteUrl}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }));
  } catch (error) {
    console.error('Sitemap companies fetch error:', error);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...blogRoutes,      // Blog posts now at 0.85 — above job listings
    ...jobsRoutes,
    ...companiesRoutes,
  ];
}
