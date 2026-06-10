import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sourceId, isActive, dailyLimit, adId, adCode, jobId } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing parameter: action' }, { status: 400 });
    }

    // 1. Action: Toggle Sourcing Connector State
    if (action === 'toggleSource') {
      if (!sourceId) {
        return NextResponse.json({ error: 'Missing sourceId for toggleSource' }, { status: 400 });
      }

      const updated = await prisma.jobSource.update({
        where: { id: sourceId },
        data: { isActive: !!isActive }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 2. Action: Update Crawl Daily Quotas Limit
    if (action === 'updateLimit') {
      if (!sourceId || dailyLimit === undefined) {
        return NextResponse.json({ error: 'Missing sourceId or dailyLimit' }, { status: 400 });
      }

      const updated = await prisma.jobSource.update({
        where: { id: sourceId },
        data: { dailyLimit: parseInt(dailyLimit, 10) }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 3. Action: Update Google AdSense placement script and toggles
    if (action === 'updateAd') {
      if (!adId || adCode === undefined) {
        return NextResponse.json({ error: 'Missing adId or adCode' }, { status: 400 });
      }

      const updated = await prisma.adPlacement.update({
        where: { id: adId },
        data: {
          adCode,
          isActive: isActive !== undefined ? !!isActive : true
        }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 4. Action: Approve Job Listing
    if (action === 'approveJob') {
      if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId for approveJob' }, { status: 400 });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'published',
          expiresAt
        }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 5. Action: Reject Job Listing (Mark Rejected)
    if (action === 'rejectJob') {
      if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId for rejectJob' }, { status: 400 });
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: { status: 'rejected' }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 6. Action: Expire Job Listing Manually
    if (action === 'expireJob') {
      if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId for expireJob' }, { status: 400 });
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: { status: 'expired' }
      });

      return NextResponse.json({ success: true, updated });
    }

    // 7. Action: Delete Job Listing
    if (action === 'deleteJob') {
      if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId for deleteJob' }, { status: 400 });
      }

      await prisma.job.delete({
        where: { id: jobId }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Invalid action requested: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API Admin POST] Error executing admin config action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error. Please verify Prisma models.' },
      { status: 500 }
    );
  }
}
