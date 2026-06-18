import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import CookieConsentBanner from '../components/cookie-consent';
import './globals.css';
import { headers } from 'next/headers';
import AdSenseContainer from '../components/adsense';
import { prisma } from '../lib/prisma';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'JobPickers | Find Your Next Career Opportunity',
  description: 'Aggregated software developer, product manager, and marketing jobs. Post listings, create professional resumes, and optimize your job search.',
  keywords: 'jobs, career search, hire developer, coding careers, remote work',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'JobPickers | Find Your Next Career Opportunity',
    description: 'Clean, trustworthy job search aggregator collecting software, design, and marketing remote jobs daily.',
    url: '/',
    siteName: 'JobPickers',
    type: 'website'
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = headersList.get('x-url') || siteUrl;

  let footerAdCode = '';
  try {
    const footerAd = await prisma.adPlacement.findUnique({ where: { name: 'footer' } });
    if (footerAd && footerAd.isActive) {
      footerAdCode = footerAd.adCode;
    }
  } catch (error) {
    console.error('Error fetching footer ad placement:', error);
  }

  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <div className="max-w-7xl mx-auto px-4 w-full">
          <AdSenseContainer placementName="footer" adCode={footerAdCode} className="max-w-4xl" />
        </div>
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

