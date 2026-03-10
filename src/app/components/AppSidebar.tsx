import { Search, Settings, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { SidebarCategory } from './SidebarCategory';
import { SidebarButton } from './SidebarButton';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#0A0A0A] border-r border-[#E6E8EC] dark:border-[#1F1F1F] transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-[#111827] dark:text-[#F7F8FA]">
              Radar Licitações
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {/* Category: Buscar Licitações */}
          <SidebarCategory title="Buscar Licitações" isCollapsed={isCollapsed}>
            <SidebarButton
              icon={Search}
              label="Busca Licitações"
              path="/"
              isCollapsed={isCollapsed}
              matchPaths={['/resultados']}
            />

            <SidebarButton
              icon={Bookmark}
              label="Licitações Salvas"
              path="/licitacoes-salvas"
              isCollapsed={isCollapsed}
            />
          </SidebarCategory>

          {/* Spacer between categories */}
          <div className="pt-4"></div>

          {/* Settings (no category) */}
          <SidebarButton
            icon={Settings}
            label="Configurações"
            path="/configuracoes"
            isCollapsed={isCollapsed}
          />
        </nav>
      </div>
    </aside>
  );
}