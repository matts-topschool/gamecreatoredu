/**
 * Main application layout with navigation.
 */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Pages that don't need sidebar
  const noSidebarPaths = ['/', '/auth', '/play', '/pricing', '/about'];
  const showSidebar = !noSidebarPaths.some(path => 
    location.pathname === path || location.pathname.startsWith('/auth') || location.pathname.startsWith('/play')
  );

  // Full-width pages (landing, auth)
  const fullWidthPaths = ['/', '/auth', '/pricing', '/about'];
  const isFullWidth = fullWidthPaths.some(path => 
    location.pathname === path || location.pathname.startsWith('/auth')
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''} ${isFullWidth ? '' : 'p-6'}`}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
