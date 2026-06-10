import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing job listing identifier', { status: 400 });
    }

    // 1. Check if the job exists
    const job = await prisma.job.findUnique({
      where: { id },
      select: { applyUrl: true }
    });

    if (!job) {
      return new Response('Job vacancy not found', { status: 404 });
    }

    // 2. Increment apply counter tracking
    try {
      await prisma.job.update({
        where: { id },
        data: { applyClicks: { increment: 1 } }
      });

      // 3. Create simulated user application tracking logs to display in their dashboard
      const user = await prisma.user.findFirst({
        where: { role: 'user' }
      });
      if (user) {
        const existingApp = await prisma.applicationTracking.findFirst({
          where: { userId: user.id, jobId: id }
        });
        if (!existingApp) {
          await prisma.applicationTracking.create({
            data: {
              userId: user.id,
              jobId: id,
              status: 'applied',
              notes: 'Redirected to application page from JobPickers board.'
            }
          });
        }
      }
    } catch (err) {
      console.error('[API Jobs Apply] Failed to record application details:', err);
    }

    // 4. Perform redirection to the actual apply URL
    return NextResponse.redirect(job.applyUrl);
  } catch (error) {
    console.error('[API Jobs Apply GET] Error performing click track redirection:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
