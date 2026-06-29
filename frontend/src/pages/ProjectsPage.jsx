import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Calendar, DollarSign, FolderKanban, Plus, ArrowRight } from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterClient, setFilterClient] = useState('ALL');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients?isArchived=false');
      if (response.data && response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (err) {
      console.error('Failed to load clients:', err.message);
    }
  };

  const fetchProjects = async () => {
    try {
      let queryParams = '?isArchived=false';
      if (filterStatus && filterStatus !== 'ALL') queryParams += `&status=${filterStatus}`;
      if (filterClient && filterClient !== 'ALL') queryParams += `&clientId=${filterClient}`;

      const response = await api.get(`/projects${queryParams}`);
      if (response.data && response.data.success) {
        setProjects(response.data.data.projects);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch projects');
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await Promise.all([fetchClients(), fetchProjects()]);
      setLoading(false);
    };
    initPage();
  }, [filterStatus, filterClient]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const response = await api.post('/projects', {
        title,
        description,
        clientId,
        startDate,
        deadline: deadline || undefined,
        totalBudget: totalBudget ? parseFloat(totalBudget) : undefined
      });

      if (response.data && response.data.success) {
        setTitle('');
        setDescription('');
        setClientId('');
        setStartDate('');
        setDeadline('');
        setTotalBudget('');
        setShowModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error?.message || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const response = await api.put(`/projects/${projectId}`, { status: newStatus });
      if (response.data && response.data.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to update project status');
    }
  };

  const formatCurrency = (val) => {
    return val?.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    }) || '₹0.00';
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'No deadline';
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProjectBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default'; // emerald
      case 'in_progress':
        return 'secondary'; // blue
      case 'on_hold':
        return 'outline'; // amber
      default:
        return 'outline'; // slate
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
    <DashboardLayout title="Projects">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Track project timelines, status, and deliverables</p>
          </div>

          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="font-semibold flex items-center gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  Create New Project
                </DialogTitle>
              </DialogHeader>

              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="projectTitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project Title
                  </Label>
                  <Input
                    id="projectTitle"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E-Commerce Redesign"
                    className="rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="projectDesc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </Label>
                  <textarea
                    id="projectDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary/80 rounded-xl text-foreground text-sm outline-none resize-none"
                    placeholder="Deliverable CMS portals or requirements"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assign Client
                  </Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="rounded-xl border border-border bg-background text-foreground">
                      <SelectValue placeholder="Select a Client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="deadlineDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Deadline Date
                    </Label>
                    <Input
                      id="deadlineDate"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="projectBudget" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Budget (INR)
                  </Label>
                  <Input
                    id="projectBudget"
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="e.g. 50000"
                    className="rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-xl"
                  >
                    {formLoading ? 'Saving...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex gap-3 text-sm text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
          <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[160px]">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="rounded-xl border border-border bg-background text-foreground h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[200px]">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Client</Label>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="rounded-xl border border-border bg-background text-foreground h-9">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Clients</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((proj) => (
              <Card
                key={proj._id}
                className="shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      {proj.clientId?.company || proj.clientId?.name}
                    </span>
                    <Badge variant={getProjectBadgeVariant(proj.status)}>
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                    <Link to={`/projects/${proj._id}`} className="hover:underline">
                      {proj.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {proj.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="border-t border-border/50 pt-4 space-y-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Budget</span>
                      <span className="font-semibold text-foreground">{proj.totalBudget ? formatCurrency(proj.totalBudget) : 'TBD'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Deadline</span>
                      <span className="font-semibold text-foreground">{formatDate(proj.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4 pt-2">
                    <Link
                      to={`/projects/${proj._id}`}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Milestones
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Quick status change selector */}
                    {proj.status !== 'completed' && (
                      <Select
                        value={proj.status}
                        onValueChange={(val) => handleStatusChange(proj._id, val)}
                      >
                        <SelectTrigger className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-12 bg-card text-card-foreground border border-border border-dashed rounded-2xl text-center text-muted-foreground text-sm shadow-sm">
              No projects found. Create a new project to get started.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
