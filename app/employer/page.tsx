import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import EmployerDashboardClient from './employer-client';

export const dynamic = 'force-dynamic';

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Restrict access to logged in employers and admins
  if (!session) {
    redirect('/login?callbackUrl=/employer');
  }

  const role = (session.user as any).role;
  if (role !== 'employer' && role !== 'admin') {
    // Redirect job seekers to their own dashboard
    redirect('/dashboard');
  }

  return <EmployerDashboardClient initialUser={session.user} />;
}
