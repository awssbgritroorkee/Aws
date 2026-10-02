import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Compass,
  User,
  Award,
  Users,
  BookOpen,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import OriginalLogoMark from './OriginalLogoMark';

const DashboardSidebar = ({ onCloseMobile }) => {
  const location = useLocation();

  const mainNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: 'My Registrations',
      path: '/dashboard/registrations',
      exact: false,
      icon: CalendarCheck,
    },
    {
      name: 'Explore Challenges',
      path: '/challenges',
      exact: false,
      icon: Compass,
    },
  ];

  const growthNavItems = [
    {
      name: 'My Builder Profile',
      path: '/dashboard/profile',
      exact: false,
      icon: User,
    },
    {
      name: 'Certificates & Badges',
      path: '#',
      isPlaceholder: true,
      icon: Award,
    },
  ];

  const communityNavItems = [
    {
      name: 'Refer Builders',
      path: '#',
      isPlaceholder: true,
      icon: Users,
    },
    {
      name: 'Resources',
      path: '#',
      isPlaceholder: true,
      icon: BookOpen,
    },
  ];

  const isLinkActive = (item) => {
    if (item.path === '#') return false;
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = isLinkActive(item);

    const baseClasses = `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`;

    const activeClasses = `bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white font-semibold border-r-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]`;

    const inactiveClasses = `text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]`;

    const placeholderClasses = `text-gray-500 cursor-not-allowed hover:bg-transparent`;

    if (item.isPlaceholder) {
      return (
        <li key={item.name}>
          <div className={`${baseClasses} ${placeholderClasses}`}>
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span>{item.name}</span>
            </div>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">
              Soon
            </span>
          </div>
        </li>
      );
    }

    return (
      <li key={item.name}>
        <NavLink
          to={item.path}
          onClick={onCloseMobile}
          className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                active ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'
              }`}
            />
            <span className="truncate">{item.name}</span>
          </div>
          {active && (
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <aside className="w-64 bg-[#050505] border-r border-white/10 text-gray-400 h-screen sticky top-0 flex flex-col justify-between p-4 z-40 select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <OriginalLogoMark className="w-8 h-8 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white uppercase">
                  AWS SBG
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HUB
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500 leading-none mt-0.5">
                Student Dashboard
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Nav Sections */}
        <nav className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* MAIN */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Main
            </p>
            <ul className="space-y-1">
              {mainNavItems.map(renderNavItem)}
            </ul>
          </div>

          {/* GROWTH & ASSETS */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Growth &amp; Assets
            </p>
            <ul className="space-y-1">
              {growthNavItems.map(renderNavItem)}
            </ul>
          </div>

          {/* COMMUNITY & UTILITIES */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Community &amp; Utilities
            </p>
            <ul className="space-y-1">
              {communityNavItems.map(renderNavItem)}
            </ul>
          </div>
        </nav>
      </div>

      {/* Footer / Badge */}
      <div className="pt-4 mt-2 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-300 truncate">AWS Builder Club</p>
            <p className="text-[10px] text-gray-500 truncate">RIT Roorkee Chapter</p>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
