import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { enrichJobDetails } from '../../../lib/ai';
import { generateJobSlug } from '../../../lib/connectors/connector';

// Simple regex-based XSS HTML sanitizer for description fields
function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove <script> tags
    .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '') // remove inline handlers like onclick, onload
    .replace(/javascript\s*:/gi, '') // block javascript protocol links
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // remove iframe inclusions
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      companyLogo,
      companyWebsite,
      title,
      category,
      remoteType,
      employmentType,
      experienceLevel,
      location,
      salary,
      skills,
      description,
      applyUrl,
      companyHoneypot,
      featured
    } = body;

    // 1. Spam Honey-Pot Protection
    if (companyHoneypot && companyHoneypot.trim().length > 0) {
      console.warn(`[Anti-Spam HoneyPot] Blocked automatic bot submission containing value: "${companyHoneypot}"`);
      return NextResponse.json(
        { error: 'Automatic bot submission detected. Request rejected.' },
        { status: 400 }
      );
    }

    // 2. Core field validations
    if (!companyName || !title || !description || !applyUrl) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: company name, title, description, and application link.' },
        { status: 400 }
      );
    }

    // Basic URL validation
    const isEmail = applyUrl.includes('@') && !applyUrl.startsWith('http');
    const isUrl = applyUrl.startsWith('http://') || applyUrl.startsWith('https://');
    if (!isEmail && !isUrl) {
      return NextResponse.json(
        { error: 'Invalid application link: Must be a valid HTTP/HTTPS URL or an email address.' },
        { status: 400 }
      );
    }

    // 3. Resolve Company brand profile
    const companySlug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let company = await prisma.company.findUnique({
      where: { name: companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companySlug,
          logo: companyLogo || '',
          website: companyWebsite || '',
          description: `Leading provider of solutions in the ${category || 'Software'} industry.`
        }
      });
    } else if (companyLogo && !company.logo) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { logo: companyLogo }
      });
    }

    // 4. Invoke AI / Rules-based Enrichment Layer
    const aiDetails = await enrichJobDetails(title, description, location || 'Remote');

    // 5. HTML Description Sanitization
    const sanitizedDescription = sanitizeHtml(description);

    const cleanTitle = aiDetails.title || title;
    const finalSlug = generateJobSlug(cleanTitle, companyName);
    const parsedSalary = salary ? parseInt(salary, 10) : null;
    const skillsList = skills || (aiDetails.skills.length > 0 ? aiDetails.skills.join(', ') : 'Not Specified');

    // default expiry 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const job = await prisma.job.create({
      data: {
        title: cleanTitle,
        slug: finalSlug,
        companyId: company.id,
        description: sanitizedDescription,
        salaryMin: parsedSalary,
        salaryMax: parsedSalary,
        location: location || 'Remote',
        remoteType: remoteType || aiDetails.location.remoteType || 'remote',
        employmentType: employmentType || 'full-time',
        experienceLevel: experienceLevel || 'mid',
        category: category || aiDetails.category || 'Software',
        skills: skillsList,
        sourceName: 'Employer',
        featured: featured === 'premium',
        applyUrl,
        status: aiDetails.isSpam ? 'draft' : 'published', // Move spam posts to draft review
        expiresAt
      }
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    console.error('[API Employer POST] Failed to publish employer job vacancy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error. Please verify Prisma migrations.' },
      { status: 500 }
    );
  }
}
