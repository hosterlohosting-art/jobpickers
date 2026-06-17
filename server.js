import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually to ensure environment variables are present in production/cPanel
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] ? match[2].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        // Only set if not already defined by the environment
        if (!process.env[match[1]]) {
          process.env[match[1]] = value;
        }
      }
    });
    console.log('> Loaded .env variables manually. TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'PRESENT' : 'MISSING');
  } else {
    console.log('> No .env file found at', envPath);
  }
} catch (e) {
  console.error('> Failed to load .env file manually:', e);
}

// Automatically generate Prisma Client on server boot if running in production/cPanel
if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  try {
    console.log('> Production boot: Generating Prisma Client for cPanel architecture...');
    execSync('npx prisma generate', { 
      cwd: __dirname,
      stdio: 'inherit',
      env: process.env // pass loaded env variables
    });
    console.log('> Prisma Client generation completed successfully!');
  } catch (e: any) {
    console.error('> Failed to generate Prisma Client on boot:', e.message);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Next.js app preparation failed:', err);
  process.exit(1);
});
