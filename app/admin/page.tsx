import { prisma } from '../../lib/prisma';
import { ShieldCheck } from 'lucide-react';
import AdminClientDashboard from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let stats = { 
    total: 0, 
    active: 0, 
    drafts: 0,
    expired: 0, 
    imported: 0,
    clicks: 0,
    activeSources: 0,
    failedSyncs: 0
  };
  let connectors: any[] = [];
  let logs: any[] = [];
  let adPlacements: any[] = [];
  let recentJobs: any[] = [];
  let employerSubmissions: any[] = [];

  try {
    // 1. Core aggregates
    const totalJobs = await prisma.job.count({});
    const activeJobs = await prisma.job.count({ where: { status: 'published' } });
    const draftJobs = await prisma.job.count({ where: { status: 'draft' } });
    const expiredJobs = await prisma.job.count({ where: { status: 'expired' } });
    
    // Count jobs imported today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const importedToday = await prisma.job.count({
      where: {
        createdAt: { gte: startOfDay },
        NOT: { sourceName: 'Employer' }
      }
    });

    // Sum of apply clicks
    const clickAggregation = await prisma.job.aggregate({
      _sum: {
        applyClicks: true
      }
    });
    const totalClicks = clickAggregation._sum.applyClicks || 0;

    // Active source configurations
    const activeSourcesCount = await prisma.jobSource.count({
      where: { isActive: true }
    });

    // Failed sync runs in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const failedSyncsCount = await prisma.importLog.count({
      where: {
        status: 'failed',
        startedAt: { gte: oneDayAgo }
      }
    });

    stats = {
      total: totalJobs,
      active: activeJobs,
      drafts: draftJobs,
      expired: expiredJobs,
      imported: importedToday,
      clicks: totalClicks,
      activeSources: activeSourcesCount,
      failedSyncs: failedSyncsCount
    };

    // 2. Fetch Job Sources
    connectors = await prisma.jobSource.findMany({
      orderBy: { name: 'asc' }
    });

    // 3. Fetch Sync Logs
    logs = await prisma.importLog.findMany({
      take: 8,
      orderBy: { startedAt: 'desc' },
      include: {
        source: { select: { name: true } }
      }
    });

    // 4. Fetch Ad Placements
    adPlacements = await prisma.adPlacement.findMany({
      orderBy: { name: 'asc' }
    });

    // 5. Fetch Recent 10 Jobs
    recentJobs = await prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } }
      }
    });

    // 6. Fetch Recent 10 Employer Submissions
    employerSubmissions = await prisma.job.findMany({
      where: { sourceName: 'Employer' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } }
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Banner Header Info */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-accent-green" />
          <div>
            <h1 className="text-xl font-extrabold text-slateText-primary">Administrative Controller</h1>
            <p className="text-xs text-slateText-muted mt-1">Manage indexing crawls, check ingestion logs, and publish AdSense ads codes.</p>
          </div>
        </div>
        <div className="text-xs bg-slateText-primary/10 text-slateText-primary font-bold px-3 py-1.5 rounded-full">
          Super Administrator Account
        </div>
      </div>

      {/* Render Client dashboard holding active tabs and state updates */}
      <AdminClientDashboard 
        stats={stats} 
        connectors={connectors} 
        logs={logs} 
        adPlacements={adPlacements}
        recentJobs={recentJobs}
        employerSubmissions={employerSubmissions}
      />

    </div>
  );
}
