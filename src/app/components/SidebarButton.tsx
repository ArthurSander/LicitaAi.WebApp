import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router';
import { LucideIcon } from 'lucide-react';

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isCollapsed: boolean;
  matchPaths?: string[]; // Additional paths that should make this button active
}

export function SidebarButton({ 
  icon: Icon, 
  label, 
  path, 
  isCollapsed,
  matchPaths = []
}: SidebarButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === path || matchPaths.includes(location.pathname);

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(path)}
      className={`w-full justify-start ${
        isActive
          ? 'bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]'
          : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </Button>
  );
}
