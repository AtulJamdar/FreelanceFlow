import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FolderKanban,
  FileText,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Briefcase
} from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return val?.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    }) || '₹0.00';
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInvoiceBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'partially_paid':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-16 h-16 animate-pulse">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Overview">
      {/* Container spacing using larger margins */}
      <div className="space-y-10 md:space-y-12 py-4">
        
        {/* Welcome Section - Larger Header Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Welcome back!
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">
            Here is a summary of your freelance aggregates today.
          </p>
        </div>

        {error && (
          <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-2xl flex gap-4 text-sm text-destructive font-medium shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid - Bigger Cards with Generous Padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-6 md:p-8">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Total Clients
              </CardTitle>
              <Users className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="text-3xl md:text-4xl font-black text-foreground">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Active client profiles on directory</p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-6 md:p-8">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Active Projects
              </CardTitle>
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="text-3xl md:text-4xl font-black text-foreground">{stats?.activeProjects || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Deliverables in development</p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-6 md:p-8">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Completed
              </CardTitle>
              <FolderKanban className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="text-3xl md:text-4xl font-black text-foreground">{stats?.completedProjects || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Projects archived as complete</p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-6 md:p-8">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Overdue Invoices
              </CardTitle>
              <AlertCircle className="w-6 h-6 text-destructive" />
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="text-3xl md:text-4xl font-black text-destructive">{stats?.overdueInvoices || 0}</div>
              <p className="text-xs text-destructive mt-2">Invoices past payment deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger stats - Larger Display Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-md rounded-2xl border border-border border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader className="p-6 md:p-8 pb-3">
              <CardDescription className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Billed Gross</CardDescription>
              <CardTitle className="text-3xl md:text-4xl font-black tracking-tight mt-1 text-foreground">
                {formatCurrency(stats?.totalInvoiced)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Gross aggregate of all invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl border border-border border-l-4 border-l-primary/70 hover:shadow-lg transition-shadow">
            <CardHeader className="p-6 md:p-8 pb-3">
              <CardDescription className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Collected</CardDescription>
              <CardTitle className="text-3xl md:text-4xl font-black tracking-tight mt-1 text-primary">
                {formatCurrency(stats?.totalPaid)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex items-center gap-2 text-xs text-primary mt-1">
                <DollarSign className="w-4 h-4" />
                <span>Payments successfully cleared</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl border border-border border-l-4 border-l-amber-500/80 hover:shadow-lg transition-shadow">
            <CardHeader className="p-6 md:p-8 pb-3">
              <CardDescription className="text-xs font-black uppercase tracking-wider text-muted-foreground">Outstanding Balance</CardDescription>
              <CardTitle className="text-3xl md:text-4xl font-black tracking-tight mt-1 text-amber-600 dark:text-amber-400">
                {formatCurrency(stats?.outstandingAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>Pending invoices balance</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices Table - Large Card, Spacious Layout */}
        <Card className="shadow-md rounded-2xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8 pb-4">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-foreground">
                <FileText className="w-6 h-6 text-primary" />
                Recent Invoices
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">Your last 5 issued client invoices</CardDescription>
            </div>
            <Link
              to="/invoices"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1 transition-all"
            >
              View Invoices
            </Link>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 pt-0">
            <div className="rounded-2xl border border-border overflow-hidden bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 h-14 border-b border-border">
                    <TableHead className="font-black text-xs uppercase text-muted-foreground px-6">Invoice No</TableHead>
                    <TableHead className="font-black text-xs uppercase text-muted-foreground px-6">Client</TableHead>
                    <TableHead className="font-black text-xs uppercase text-muted-foreground px-6">Due Date</TableHead>
                    <TableHead className="font-black text-xs uppercase text-muted-foreground px-6 text-right">Amount</TableHead>
                    <TableHead className="font-black text-xs uppercase text-muted-foreground px-6 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentInvoices?.length > 0 ? (
                    stats.recentInvoices.map((inv) => (
                      <TableRow key={inv._id} className="hover:bg-muted/20 h-16 border-b border-border transition-colors">
                        <TableCell className="font-bold text-primary px-6">
                          <Link to={`/invoices/${inv._id}`} className="hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-bold text-foreground px-6">
                          {inv.clientName || 'Unknown Client'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm px-6">
                          {formatDate(inv.dueDate)}
                        </TableCell>
                        <TableCell className="text-right font-black text-foreground px-6 text-base">
                          {formatCurrency(inv.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center px-6">
                          <Badge variant={getInvoiceBadgeVariant(inv.status)} className="px-3 py-1 font-bold rounded-lg text-xs uppercase">
                            {inv.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="5" className="h-32 text-center text-base text-muted-foreground px-6">
                        No invoices found. Issue your first invoice to populate statistics.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
