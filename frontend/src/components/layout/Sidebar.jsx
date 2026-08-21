import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import SbgChipLogo from './SbgChipLogo';

// ── Inline SVG icons (no external icon library dependency) ──────────────
const ICONS = {
  home: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  'academic-cap': (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm5.99 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
  ),
  'cpu-chip': (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
};

const Sidebar = () => {
  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo Area */}
      <div className="sidebar-logo-area">
        <SbgChipLogo size={28} />
        <div>
          <p className="text-xs font-bold text-text-primary leading-tight tracking-tight">AWS Student</p>
          <p className="text-xs font-bold text-aws-orange leading-tight tracking-tight">Builder Groups</p>
        </div>
        <div className="ml-auto">
          <span className="badge-purple badge text-[10px]">RIT</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
        <p className="sidebar-section-label">Navigation</p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                id={`nav-${item.id}`}
              >
                <span className="nav-icon text-text-subtle w-4.5 h-4.5 flex-shrink-0">
                  {ICONS[item.icon]}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2">
          <div className="avatar w-7 h-7 text-xs bg-gradient-to-br from-sbg-purple to-sbg-purple-dark text-white flex-shrink-0">
            RK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">Rahul Kumar</p>
            <p className="text-[10px] text-text-subtle truncate">Group Lead</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
