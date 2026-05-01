import { getUserProfile } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  if (profile?.household_id) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
