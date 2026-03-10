import { Search, Bell, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0A0A0A] border-b border-[#E6E8EC] dark:border-[#1F1F1F] backdrop-blur-sm bg-white/95 dark:bg-[#0A0A0A]/95">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left side - Logo and product name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] dark:bg-[#1E3A8A] rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#111827] dark:text-[#F7F8FA]">Radar Licitações</span>
        </div>

        {/* Right side - Navigation items */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F7F8FA] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] relative transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] dark:bg-[#93C5FD] rounded-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F7F8FA] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
          <div className="ml-2 w-8 h-8 bg-[#E6E8EC] dark:bg-[#1F1F1F] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#D1D5DB] dark:hover:bg-[#2A2A2A] transition-colors">
            <span className="text-sm text-[#111827] dark:text-[#F7F8FA]">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}