import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Projects', path: '/projects' },
    { name: 'Invoices', path: '/invoices' }
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
              <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg group-hover:scale-105 transition-transform duration-200 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-indigo-200">
                FreelanceFlow
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{user?.businessName || user?.name}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            
            <button
              onClick={logout}
              className="px-4 py-2 border border-slate-800 hover:border-red-500/30 bg-slate-950 hover:bg-red-500/5 text-slate-400 hover:text-red-400 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
