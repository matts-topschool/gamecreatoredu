/**
 * Main navigation bar.
 */
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Gamepad2, 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '@/stores/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <nav className={`sticky top-0 z-50 border-b ${isLandingPage ? 'bg-white/80 backdrop-blur-xl border-slate-200/50' : 'bg-background border-border'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
            data-testid="nav-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit tracking-tight">GameCraft</span>
            <span className="text-violet-600 font-outfit">EDU</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/studio">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="nav-studio"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Studio
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="nav-dashboard"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="nav-marketplace"
                  >
                    Marketplace
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/pricing">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    About
                  </Button>
                </Link>
                <Link to="/integrations">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="nav-integrations">
                    Integrations
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 hover:bg-slate-100 rounded-full px-2"
                    data-testid="nav-user-menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                      <AvatarFallback className="bg-violet-100 text-violet-700 font-medium">
                        {getInitials(user?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.display_name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.display_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} data-testid="menu-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                    data-testid="menu-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" data-testid="nav-login">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button 
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6"
                    data-testid="nav-signup"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
