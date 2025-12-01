import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-blue-600">
                Vibrant City Tours
              </Link>
              <div className="flex gap-4">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/dashboard/guias" className="text-sm text-gray-600 hover:text-gray-900">
                  Guias
                </Link>
                <Link href="/dashboard/tours" className="text-sm text-gray-600 hover:text-gray-900">
                  Tours
                </Link>
                <Link href="/dashboard/agenda" className="text-sm text-gray-600 hover:text-gray-900">
                  Agenda
                </Link>
                <Link href="/dashboard/comparativos" className="text-sm text-gray-600 hover:text-gray-900">
                  Comparativos
                </Link>
                <Link href="/dashboard/reviews" className="text-sm text-gray-600 hover:text-gray-900">
                  Reviews
                </Link>
                <Link href="/dashboard/financial" className="text-sm text-gray-600 hover:text-gray-900">
                  Financial
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.name}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
