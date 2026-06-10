import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { role: 'user' }
    });

    if (!user) {
      return NextResponse.json({ error: 'Simulated user not found' }, { status: 404 });
    }

    const existingBookmark = await prisma.savedJob.findFirst({
      where: { 
        userId: user.id, 
        jobId 
      }
    });

    if (existingBookmark) {
      await prisma.savedJob.delete({
        where: { id: existingBookmark.id }
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      await prisma.savedJob.create({
        data: { 
          userId: user.id, 
          jobId 
        }
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error: any) {
    console.error('[API Jobs Save] Error toggling bookmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
