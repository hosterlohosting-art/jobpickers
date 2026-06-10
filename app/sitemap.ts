import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/jobs',
    '/remote-jobs',
    '/employer',
    '/blog',
    '/about',
    '/contact',
    '/cookies',
    '/dmca',
    '/editorial',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${cleanSiteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : (route === '/jobs' || route === '/remote-jobs' ? 0.9 : 0.7),
  }));

  // 2. Dynamic Jobs Routes
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
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Sitemap jobs fetch error:', error);
  }

  // 3. Dynamic Companies Routes
  let companiesRoutes: MetadataRoute.Sitemap = [];
  try {
    const companies = await prisma.company.findMany({
      select: { slug: true, updatedAt: true },
    });
    companiesRoutes = companies.map((company) => ({
      url: `${cleanSiteUrl}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap companies fetch error:', error);
  }

  // 4. Dynamic Blog Routes
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
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap blogs fetch error:', error);
  }

  return [...staticRoutes, ...jobsRoutes, ...companiesRoutes, ...blogRoutes];
}
