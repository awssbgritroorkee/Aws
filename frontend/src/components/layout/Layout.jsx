import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

/**
 * Layout — Root shell: Sidebar | (TopNav + Outlet)
 * All authenticated pages share this layout via React Router's <Outlet />.
 */
const Layout = () => (
  <div className="app-shell" id="app-shell">
    <Sidebar />

    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopNav />

      <main className="page-content" id="main-content" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
