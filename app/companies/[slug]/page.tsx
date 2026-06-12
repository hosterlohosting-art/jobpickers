import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import CompanyClientDashboard from './company-client';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { Metadata } from 'next';

interface CompanyPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug }
  });
  if (!company) return {};
  return {
    title: `${company.name} Employee Reviews & Salaries - JobPickers`,
    description: `Read verified employee reviews, look up salary stats, and explore active remote jobs at ${company.name} on JobPickers.`
  };
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  // 1. Fetch company profile details
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      jobs: {
        where: { status: 'published' },
        orderBy: { postedAt: 'desc' }
      }
    }
  });

  if (!company) {
    notFound();
  }

  // 2. Fetch employee reviews history
  const reviews = await prisma.companyReview.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Get session profile
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Back to directory */}
      <Link href="/companies" className="flex items-center gap-1 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to company directory
      </Link>

      {/* Render interactive client component dashboard */}
      <CompanyClientDashboard 
        company={company} 
        initialReviews={reviews} 
        jobs={company.jobs} 
        currentUser={session?.user || null}
      />

    </div>
  );
}
