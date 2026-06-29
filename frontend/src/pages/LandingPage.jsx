import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Lock,
  Download,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl text-primary-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight text-foreground uppercase">
              FreelanceFlow
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Analytics</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-border/60 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all size-10 flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-foreground">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="rounded-xl font-bold shadow-sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-border/60 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all size-10 flex items-center justify-center"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-6 py-6 space-y-6 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4 text-base font-bold text-muted-foreground">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground transition-colors py-2 border-b border-border/40"
              >
                Features
              </a>
              <a
                href="#stats"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground transition-colors py-2"
              >
                Analytics
              </a>
            </div>

            {/* CTA Buttons inside Mobile Menu */}
            <div className="flex flex-col gap-3 pt-2">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl font-bold py-6 flex items-center justify-center gap-1.5 shadow-sm">
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl font-bold py-6 border-border">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl font-bold py-6 shadow-sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The Unified SaaS Suite for Freelancers
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-foreground max-w-4xl mx-auto">
            Scale Your Freelance business with <span className="text-primary bg-clip-text">Total Control</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Manage clients, track deliverables, automate professional invoicing, and scan overdue ledgers in a single high-performance dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-base px-8 py-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-2xl font-bold hover:bg-secondary/50 border-border">
                    Explore Features
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Interactive UI Mockup Demo */}
          <div className="pt-12 md:pt-16 max-w-5xl mx-auto">
            <div className="relative rounded-3xl border border-border/80 bg-card p-4 md:p-6 shadow-2xl overflow-hidden">
              {/* Card top border line decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
              
              {/* Mock UI Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-muted-foreground ml-3">freelanceflow.app/dashboard</span>
                </div>
                <div className="h-2 w-32 bg-muted rounded-full"></div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <Card className="border border-border/40 shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Revenue</span>
                    <div className="text-2xl font-black text-foreground">₹2,84,500.00</div>
                    <span className="text-[10px] text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +18.4% this month
                    </span>
                  </CardContent>
                </Card>

                <Card className="border border-border/40 shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Active Deliverables</span>
                    <div className="text-2xl font-black text-foreground">12 Projects</div>
                    <span className="text-[10px] text-muted-foreground">8 clients linked</span>
                  </CardContent>
                </Card>

                <Card className="border border-border/40 shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Pending Collection</span>
                    <div className="text-2xl font-black text-amber-500">₹45,200.00</div>
                    <span className="text-[10px] text-amber-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      3 invoices overdue
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Mock Invoice Table */}
              <div className="mt-6 border border-border/50 rounded-2xl overflow-hidden bg-background text-left">
                <div className="px-5 py-4 border-b border-border/50 flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">Ledger Transactions</span>
                  <Badge variant="default" className="text-[10px] font-bold">LIVE STATS</Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs p-3 bg-card rounded-xl border border-border/30">
                    <span className="font-bold text-primary">INV-2026-001</span>
                    <span className="font-semibold text-foreground">Apex Digital Corp</span>
                    <span className="font-black text-foreground">₹75,000.00</span>
                    <Badge variant="default" className="text-[9px] uppercase px-2 py-0.5">PAID</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs p-3 bg-card rounded-xl border border-border/30">
                    <span className="font-bold text-primary">INV-2026-002</span>
                    <span className="font-semibold text-foreground">Redwood Media</span>
                    <span className="font-black text-foreground">₹32,500.00</span>
                    <Badge variant="destructive" className="text-[9px] uppercase px-2 py-0.5">OVERDUE</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-muted/30 border-t border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              Built for Modern Independent Professionals
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to handle business operations, billing pipelines, and client directories with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Client Directory</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log detailed client parameters, track accounts, and soft-archive old contracts safely without disrupting active database linkings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Project Milestones</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Break projects into itemized milestones with target dates and clear values. Complete them to auto-populate invoices instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Smart Invoicing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create sequence-numbered invoices. Compute tax amounts, generate downloadable PDF logs, and email clients directly using SMTP.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Automated Cron Checks</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Daily scans auto-transition unpaid invoices past deadlines to overdue, dispatching asynchronous email reminders to clients.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">MongoDB Aggregate Services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fetch gross billed, payments settled, outstanding balances, and recent activities in a single query using parallel pipeline aggregates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-card rounded-3xl border border-border/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Secure Architecture</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Robust JWT verification guards, clean module separation architectures, and CORS white-listings keep client records fully isolated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="stats" className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
              High Performance Aggregations
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              Aggregated Ledger Metrics at Your Fingertips
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Skip slow, repeated database lookups. FreelanceFlow implements advanced MongoDB aggregation pipelines that gather all active clients, completed projects, billed sums, collected payments, and invoice timelines concurrently.
            </p>
            
            <ul className="space-y-3 pt-2 text-sm text-foreground font-semibold">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                Real-time outstanding balance tracking
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                Automatic invoice status transitions on settlements
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                Single-query dashboard metrics fetches
              </li>
            </ul>
          </div>

          <div className="p-6 md:p-8 bg-card border border-border rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 bg-primary/15 rounded-lg text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Automated Overdue Scans</h4>
                <p className="text-[10px] text-muted-foreground">CRON SCAN STATUS: ACTIVE</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-background border border-border rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Trigger Time</span>
                  <span className="text-primary">Daily at 00:05 AM</span>
                </div>
                <p className="text-muted-foreground text-[10px]">Scans all unpaid invoices, marks past-due records, and sends email reminders asynchronously.</p>
              </div>

              <div className="p-4 bg-background border border-border rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Ledger Isolation</span>
                  <span className="text-primary font-bold">Enabled</span>
                </div>
                <p className="text-muted-foreground text-[10px]">Data is strictly partitioned by your Freelancer account, ensuring clients and projects never cross paths.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/40 border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Take Control of Your Billing Today
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of independent consultants, designers, and developers who rely on FreelanceFlow to run their business operations smoothly.
          </p>

          <div className="pt-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="text-base px-8 py-6 rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-transform">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="text-base px-8 py-6 rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-transform">
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-foreground tracking-tight">FreelanceFlow</span>
          </div>

          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} FreelanceFlow. All rights reserved. Designed for independent freelancers.
          </p>

          <div className="flex gap-6 text-xs font-semibold">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Client Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
