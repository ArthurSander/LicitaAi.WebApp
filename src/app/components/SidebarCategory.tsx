import { ChevronDown } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface SidebarCategoryProps {
  title: string;
  children: ReactNode;
  isCollapsed: boolean;
  defaultExpanded?: boolean;
}

export function SidebarCategory({ 
  title, 
  children, 
  isCollapsed, 
  defaultExpanded = true 
}: SidebarCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <>
      {/* Category Header */}
      {!isCollapsed && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] rounded-md transition-colors"
        >
          <h3 className="text-xs font-medium text-[#9CA3AF] dark:text-[#6B7280] uppercase tracking-wider">
            {title}
          </h3>
          <ChevronDown 
            className={`h-3 w-3 text-[#9CA3AF] dark:text-[#6B7280] transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>
      )}

      {/* Category Items */}
      {(isCollapsed || isExpanded) && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </>
  );
}
