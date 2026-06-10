import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address required.' }, { status: 400 });
    }

    // Store in database — check for existing subscriber first
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      return NextResponse.json({ message: 'Already subscribed!', alreadySubscribed: true });
    }

    // Create a subscriber-only user record (newsletter subscribers)
    await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        role: 'user',
        passwordHash: '',  // No password — newsletter-only account
      }
    });

    console.log(`[Newsletter] New subscriber: ${email} (source: ${source || 'footer'})`);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to the JobPickers weekly digest!' 
    });
  } catch (error: any) {
    console.error('[Newsletter] Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
