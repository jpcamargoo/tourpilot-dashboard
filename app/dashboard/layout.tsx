'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, MapPin, Calendar, TrendingUp, Star, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/guias', label: 'Guias', icon: Users },
    { href: '/dashboard/tours', label: 'Tours', icon: MapPin },
    { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
    { href: '/dashboard/comparativos', label: 'Comparativos', icon: TrendingUp },
    { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
    { href: '/dashboard/financial', label: 'Financial', icon: DollarSign },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-blue-600 hover:text-blue-700">Vibrant City Tours</span>
              <span className="text-xs text-gray-500 hidden sm:block">Dashboard</span>
            </Link>

            {/* Desktop Menu - Only show on large screens */}
            <div className="hidden xl:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center gap-3">
              <LogoutButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="xl:hidden py-4 border-t">
              <div className="flex flex-col space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="pt-3 mt-3 border-t">
                  <LogoutButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}
