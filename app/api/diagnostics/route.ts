import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      TURSO_DATABASE_URL_length: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.length : 0,
      TURSO_DATABASE_URL_masked: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 15) + '...' : 'MISSING',
      TURSO_AUTH_TOKEN_length: process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.length : 0,
      DATABASE_URL_masked: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'MISSING',
    },
    cwd: process.cwd(),
    files: {},
  };

  // Check if .env file exists in cwd or app directory
  try {
    diagnostics.files['env_in_cwd'] = fs.existsSync('.env');
    diagnostics.files['env_in_dirname'] = fs.existsSync(path.join(__dirname, '.env'));
    diagnostics.files['env_in_app_root'] = fs.existsSync(path.join(process.cwd(), '.env'));
  } catch (e: any) {
    diagnostics.files['error'] = e.message;
  }

  // Test Prisma Connection
  try {
    const jobsCount = await prisma.job.count();
    diagnostics.db = {
      connected: true,
      jobsCount,
    };
  } catch (e: any) {
    diagnostics.db = {
      connected: false,
      error_message: e.message,
      error_name: e.name,
      error_stack: e.stack,
    };
  }

  return NextResponse.json(diagnostics);
}
