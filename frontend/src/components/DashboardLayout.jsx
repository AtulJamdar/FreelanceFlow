import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from './ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Clients', path: '/clients', icon: Users },
    { title: 'Projects', path: '/projects', icon: FolderKanban },
    { title: 'Invoices', path: '/invoices', icon: FileText }
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Sidebar Header: Logo and Trigger Toggle */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-xl text-primary-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-black text-xl tracking-tight text-foreground uppercase">
            FreelanceFlow
          </span>
        </div>
        {/* Toggle inside the sidebar header */}
        <SidebarTrigger className="p-2 border border-border hover:bg-secondary rounded-xl size-9 flex items-center justify-center text-foreground" />
      </div>

      {/* Sidebar Content */}
      <SidebarContent className="flex-1 py-6 flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sidebar Footer Controls */}
        <div className="px-4 border-t border-border pt-6 mt-auto space-y-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              {theme}
            </span>
          </button>

          {/* User Account / Profile Info */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-secondary/30 border border-border/40 rounded-2xl">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold truncate text-foreground">
                {user?.businessName || user?.name}
              </span>
              <span className="block text-[10px] text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-base font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

// Global Layout wrapper containing sidebar and content container
const LayoutContent = ({ children }) => {
  const { open } = useSidebar();
  
  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Mobile Top Header (only visible on mobile screens) */}
      <header className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="p-2 border border-border hover:bg-secondary rounded-lg size-9 flex items-center justify-center text-foreground" />
          <span className="font-extrabold text-sm tracking-tight text-foreground uppercase">
            FreelanceFlow
          </span>
        </div>
      </header>

      {/* Floating Toggle Button when the sidebar is collapsed (only on desktop) */}
      {!open && (
        <div className="hidden md:block fixed top-6 left-6 z-50">
          <SidebarTrigger className="p-3 border border-border bg-card hover:bg-secondary rounded-2xl shadow-md size-11 flex items-center justify-center text-foreground hover:scale-105 transition-all duration-200">
            <Menu className="w-5 h-5" />
          </SidebarTrigger>
        </div>
      )}

      {/* Main content container with transition and conditional alignment */}
      <div className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-300 flex flex-col items-center ${
        !open ? 'md:justify-center justify-start' : 'justify-start'
      }`}>
        {/* Bounds the dashboard width so it doesn't stretch when the sidebar is closed */}
        <div className="w-full max-w-[1280px] transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children, title }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Left Hand Sidebar Panel */}
        <DashboardSidebar />

        {/* Right Hand Content Panel */}
        <LayoutContent>
          {children}
        </LayoutContent>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
