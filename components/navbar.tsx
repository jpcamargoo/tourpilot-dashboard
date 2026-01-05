'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-lg md:text-xl font-bold text-blue-600">
            Vibrant Tours
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
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
            <Link 
              href="/dashboard/reviews" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Reviews
            </Link>
            <Link 
              href="/dashboard/reports" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Relatórios
            </Link>
            <Link 
              href="/dashboard/audit-logs" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Auditoria
            </Link>
          </div>

          {/* Admin Badge (Desktop) */}
          <div className="hidden md:block text-sm text-gray-600 font-medium">
            Admin
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link 
                href="/dashboard/guias"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                👥 Guias
              </Link>
              <Link 
                href="/dashboard/tours"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                🗺️ Tours
              </Link>
              <Link 
                href="/dashboard/agenda"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                📅 Agenda
              </Link>
              <Link 
                href="/dashboard/reviews"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                ⭐ Reviews
              </Link>
              <Link 
                href="/dashboard/reports"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                📄 Relatórios
              </Link>
              <Link 
                href="/dashboard/audit-logs"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                🔍 Auditoria
              </Link>
              <div className="px-4 py-2 text-xs text-gray-500 border-t mt-2 pt-3">
                Logado como Admin
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
