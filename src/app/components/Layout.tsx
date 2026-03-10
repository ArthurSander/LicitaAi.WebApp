import { Outlet } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { useState } from 'react';

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0A]">
      <AppSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}