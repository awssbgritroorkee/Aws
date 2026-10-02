import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { Menu, ArrowLeft } from 'lucide-react';
import OriginalLogoMark from './OriginalLogoMark';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, context, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const isCoreTeam = context?.is_team_member || context?.is_staff || context?.is_superuser;
      if (isCoreTeam) {
        alert("Access Denied: Core team members cannot participate in student challenges.");
        navigate('/', { replace: true });
      }
    }
  }, [loading, user, context, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050505] text-white items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Sidebar */}
          <div className="relative z-10 w-64 max-w-[80vw]">
            <DashboardSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <OriginalLogoMark className="w-6 h-6 flex-shrink-0" />
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                Builder Hub
              </span>
            </Link>
          </div>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Site</span>
          </Link>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
