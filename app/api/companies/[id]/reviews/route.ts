import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const reviews = await prisma.companyReview.findMany({
      where: { companyId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('[API Company Reviews GET] Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const {
      roleTitle,
      rating,
      pros,
      cons,
      adviceToManagement,
      isCurrentEmployee
    } = body;

    // 1. Basic validation
    if (!roleTitle || !roleTitle.trim()) {
      return NextResponse.json({ error: 'Job title/role is required.' }, { status: 400 });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5.' }, { status: 400 });
    }

    if (!pros || pros.trim().length < 10) {
      return NextResponse.json({ error: 'Pros description must be at least 10 characters long.' }, { status: 400 });
    }

    if (!cons || cons.trim().length < 10) {
      return NextResponse.json({ error: 'Cons description must be at least 10 characters long.' }, { status: 400 });
    }

    // 2. Resolve company existence
    const company = await prisma.company.findUnique({
      where: { id: params.id }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    // 3. Optional user session link
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    // 4. Save review
    const review = await prisma.companyReview.create({
      data: {
        companyId: params.id,
        userId,
        roleTitle: roleTitle.trim(),
        rating: numericRating,
        pros: pros.trim(),
        cons: cons.trim(),
        adviceToManagement: adviceToManagement ? adviceToManagement.trim() : null,
        isCurrentEmployee: isCurrentEmployee !== false
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('[API Company Reviews POST] Failed to save review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
