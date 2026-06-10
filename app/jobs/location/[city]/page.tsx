import { prisma } from '@/lib/prisma';
import JobCard from '@/components/job-card';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Metadata } from 'next';

interface LocationPageProps {
  params: {
    city: string;
  };
}

function getCityDisplayName(city: string): string {
  // Format slug e.g. "new-york" to "New York"
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const cityName = getCityDisplayName(params.city);
  return {
    title: `Careers & Job Openings in ${cityName} - JobPickers`,
    description: `Explore all active job listings in ${cityName} aggregated daily. Apply on company site or directly via JobPickers.`
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const cityName = getCityDisplayName(params.city);

  let jobs: any[] = [];
  try {
    jobs = await prisma.job.findMany({
      where: {
        status: 'published',
        OR: [
          { location: { contains: cityName } },
          { city: { contains: cityName } }
        ]
      },
      orderBy: { postedAt: 'desc' },
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching location page jobs:', error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/jobs" className="flex items-center gap-1 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to search board
      </Link>

      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-accent-green/10 flex items-center justify-center text-accent-green">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary">Job Listings in {cityName}</h1>
          <p className="text-xs text-slateText-muted mt-1">Browse all verified local and hybrid positions active in {cityName}.</p>
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
            No active listings found in {cityName} at this time. Check back later or adjust filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
