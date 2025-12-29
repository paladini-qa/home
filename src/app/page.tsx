'use client';

import { useAuthStore } from '@/lib/store';
import { GoogleLogin } from '@/components/auth/GoogleLogin';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Top Bar */}
      <div className="flex justify-end mb-6 max-w-7xl mx-auto">
        <GoogleLogin />
      </div>

      {/* Dashboard */}
      <Dashboard />
    </main>
  );
}
