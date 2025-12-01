import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            Vibrant City Tours
          </Link>
          
          <div className="flex gap-6">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/guias" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Guias
            </Link>
            <Link 
              href="/dashboard/tours" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Tours
            </Link>
            <Link 
              href="/dashboard/agenda" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Agenda
            </Link>
          </div>

          <div className="text-sm text-gray-600">
            Admin Dashboard
          </div>
        </div>
      </div>
    </nav>
  );
}
