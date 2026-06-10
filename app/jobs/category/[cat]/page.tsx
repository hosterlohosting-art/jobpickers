import { prisma } from '@/lib/prisma';
import JobCard from '@/components/job-card';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    cat: string;
  };
}

function getCategoryDisplayName(cat: string): string {
  // Map slugs to display names
  const mapping: { [key: string]: string } = {
    'software': 'Software',
    'marketing': 'Marketing',
    'finance': 'Finance',
    'sales': 'Sales',
    'support': 'Customer Support',
    'customer-support': 'Customer Support',
    'design': 'Design',
    'data': 'Data',
    'hr': 'HR',
    'engineering': 'Software'
  };
  return mapping[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const catName = getCategoryDisplayName(params.cat);
  return {
    title: `${catName} Careers & Job Openings - JobPickers`,
    description: `Explore all active ${catName} job listings aggregated daily. Apply on company site or directly via JobPickers.`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const catName = getCategoryDisplayName(params.cat);

  let jobs: any[] = [];
  try {
    jobs = await prisma.job.findMany({
      where: {
        category: catName,
        status: 'published'
      },
      orderBy: { postedAt: 'desc' },
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category page jobs:', error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/jobs" className="flex items-center gap-1 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to search board
      </Link>

      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-accent-green/10 flex items-center justify-center text-accent-green">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary">{catName} Job Listings</h1>
          <p className="text-xs text-slateText-muted mt-1">Browse all verified {catName} positions active globally.</p>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-grayBorder rounded-lg p-8 text-center text-slateText-muted">
            No active listings found in this category at this time. Check back later or adjust filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
