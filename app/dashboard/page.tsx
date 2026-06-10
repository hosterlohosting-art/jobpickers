import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { Bookmark, FileCheck, Award, Sliders, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import JobCard from '../../components/job-card';
import SeekerClientDashboard from './dashboard-client';

export default async function SeekerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  let savedJobs: any[] = [];
  let applications: any[] = [];
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (user) {
      savedJobs = await prisma.savedJob.findMany({
        where: { userId: user.id },
        include: {
          job: {
            include: {
              company: { select: { name: true, logo: true, slug: true } }
            }
          }
        }
      });

      applications = await prisma.applicationTracking.findMany({
        where: { userId: user.id },
        include: {
          job: {
            include: {
              company: { select: { name: true, logo: true, slug: true } }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard records:', error);
  }

  // Format prisma objects to match cards structure
  const formattedSaved = savedJobs.map(sj => sj.job);
  const formattedApps = applications.map(app => ({
    ...app.job,
    appStatus: app.status,
    appNotes: app.notes,
    appDate: app.createdAt
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Welcome banner */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary">Seeker Account Panel</h1>
          <p className="text-xs text-slateText-muted mt-1">Manage saved bookmarks, track applications progress, and scan your resume.</p>
        </div>
        <div className="text-xs bg-accent-green/10 text-accent-green font-bold px-3 py-1.5 rounded-full">
          Account: {session.user?.name || 'User'}
        </div>
      </div>

      {/* Pass data to interactive client component to handle client-side tabs and the resume optimizer */}
      <SeekerClientDashboard savedJobs={formattedSaved} applications={formattedApps} />

    </div>
  );
}
