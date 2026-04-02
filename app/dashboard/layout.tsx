import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';

export const metadata = {
  title: 'Dashboard | OpenBrain',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}