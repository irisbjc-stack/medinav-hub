import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { alerts } from '@/services/mockData';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed, networkOnline } = useAppStore();
  
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      map: 'Map Viewer',
      tasks: 'Task Manager',
      fleet: 'Robot Fleet',
      zones: 'Semantic Zones',
      models: 'ML Dashboard',
      alerts: 'Alerts & Faults',
      logs: 'Audit & Logs',
      'api-docs': 'API Documentation',
      simulation: 'Simulation Mode',
      settings: 'Settings',
    };
    return titles[path] || 'MedBot';
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      {/* Main Content */}
      <div 
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">
                {getPageTitle()}
              </h1>
              
              {!networkOnline && (
                <Badge variant="warning" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline Mode
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-muted-foreground">
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="hidden lg:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  ⌘K
                </kbd>
              </Button>

              {/* Alerts */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/alerts')}
              >
                <Bell className="h-5 w-5" />
                {unacknowledgedAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                    {unacknowledgedAlerts}
                  </span>
                )}
              </Button>

              {/* Network Status */}
              <div className={cn(
                'h-2 w-2 rounded-full',
                networkOnline ? 'bg-status-active' : 'bg-status-error'
              )} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
