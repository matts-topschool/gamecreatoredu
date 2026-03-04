/**
 * Dashboard sidebar navigation.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  PlayCircle, 
  Users, 
  BarChart3,
  Store,
  Settings,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Games', href: '/dashboard/games', icon: Gamepad2 },
      { label: 'Sessions', href: '/dashboard/sessions', icon: PlayCircle },
    ]
  },
  {
    title: 'Classroom',
    items: [
      { label: 'Classes', href: '/dashboard/classes', icon: Users },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Browse Games', href: '/marketplace', icon: Store },
      { label: 'My Purchases', href: '/marketplace/purchases', icon: Gamepad2 },
    ]
  }
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background overflow-y-auto">
      <div className="flex flex-col h-full p-4">
        {/* Create Game Button */}
        <Link to="/studio/new" className="mb-6">
          <Button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 rounded-xl h-11 shadow-lg shadow-violet-200"
            data-testid="sidebar-create-game"
          >
            <Sparkles className="w-4 h-4" />
            Create Game
          </Button>
        </Link>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-6">
          {navItems.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          active 
                            ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300' 
                            : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
                        )}
                        data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon className={cn('w-4 h-4', active && 'text-violet-600')} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-border">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
            data-testid="sidebar-settings"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
