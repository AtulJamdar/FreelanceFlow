import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Clock, Plus, HelpCircle } from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      if (response.data && response.data.success) {
        setProject(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch project details');
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await api.get(`/projects/${id}/milestones`);
      if (response.data && response.data.success) {
        setMilestones(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await Promise.all([fetchProjectDetails(), fetchMilestones()]);
      setLoading(false);
    };
    initPage();
  }, [id]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const response = await api.post(`/projects/${id}/milestones`, {
        title,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate: dueDate || undefined
      });

      if (response.data && response.data.success) {
        setTitle('');
        setDescription('');
        setAmount('');
        setDueDate('');
        setShowForm(false);
        await Promise.all([fetchProjectDetails(), fetchMilestones()]);
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error?.message || 'Failed to create milestone');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      const response = await api.patch(`/milestones/${milestoneId}/complete`);
      if (response.data && response.data.success) {
        await Promise.all([fetchProjectDetails(), fetchMilestones()]);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to complete milestone');
    }
  };

  const formatCurrency = (val) => {
    return val?.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    }) || '₹0.00';
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'No due date';
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const completedMilestonesAmount = milestones
    .filter(m => m.isCompleted)
    .reduce((sum, m) => sum + (m.amount || 0), 0);

  const totalMilestonesAmount = milestones
    .reduce((sum, m) => sum + (m.amount || 0), 0);

  const progressPercent = milestones.length > 0 
    ? Math.round((milestones.filter(m => m.isCompleted).length / milestones.length) * 100)
    : 0;

  const getProjectBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <Card className="max-w-md p-6 border border-destructive/20 rounded-2xl text-center bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error Loading Project
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{error || 'Project not found'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link to="/projects">
              <Button variant="outline" className="rounded-xl">Return to Projects List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout title="Project Details">
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/40 pb-2">
          <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Project Header Info */}
        <Card className="shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge variant={getProjectBadgeVariant(project.status)}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Client: {project.clientId?.company || project.clientId?.name}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{project.title}</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                  {project.description || 'No description provided.'}
                </p>
              </div>
              <div className="bg-secondary/40 border border-border rounded-2xl p-4 self-start min-w-[200px] text-right">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Budget</span>
                <span className="block text-2xl font-extrabold text-foreground mt-0.5">{project.totalBudget ? formatCurrency(project.totalBudget) : 'TBD'}</span>
              </div>
            </div>

            {/* Dates & Metrics details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-b border-border/50 py-6 text-sm text-muted-foreground">
              <div>
                <span className="block text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-1">Timeline</span>
                <span className="font-semibold text-foreground">{formatDate(project.startDate)} — {formatDate(project.deadline)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-1">Milestones Completed</span>
                <span className="font-semibold text-foreground">
                  {milestones.filter(m => m.isCompleted).length} / {milestones.length}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-1">Invoiced Progress</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(completedMilestonesAmount)} / {formatCurrency(totalMilestonesAmount)}
                </span>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Overall Deliverable Progress</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Project Milestones
            </h2>
            {project.status !== 'completed' && (
              <Button
                variant="outline"
                onClick={() => setShowForm(!showForm)}
                className="font-semibold flex items-center gap-1.5 rounded-xl border-border"
              >
                {showForm ? 'Cancel' : 'Add Milestone'}
              </Button>
            )}
          </div>

          {/* Milestone Add Form */}
          {showForm && (
            <Card className="shadow-sm max-w-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Add Project Milestone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}
                <form onSubmit={handleCreateMilestone} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="milestoneTitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Milestone Title
                    </Label>
                    <Input
                      id="milestoneTitle"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Milestone 1: Scaffold Directory Structures"
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="milestoneDesc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      id="milestoneDesc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 bg-background border border-border focus:border-primary/80 rounded-xl text-foreground text-sm outline-none resize-none"
                      placeholder="Figma layouts or server configurations..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="milestoneAmount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Billing Amount (INR)
                      </Label>
                      <Input
                        id="milestoneAmount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 20000"
                        className="rounded-xl border border-border bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="milestoneDueDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Due Date
                      </Label>
                      <Input
                        id="milestoneDueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="rounded-xl border border-border bg-background text-slate-600"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-xl"
                  >
                    {formLoading ? 'Saving...' : 'Add Milestone'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Milestones list */}
          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((m) => (
                <div
                  key={m._id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    m.isCompleted
                      ? 'bg-muted/10 border-border/50 opacity-75'
                      : 'bg-card text-card-foreground border-border hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-foreground text-base">{m.title}</h4>
                      {m.isCompleted ? (
                        <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Pending
                        </Badge>
                      )}
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground max-w-xl">{m.description}</p>}
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono mt-2">
                      <span>Due: {formatDate(m.dueDate)}</span>
                      {m.isCompleted && m.completedAt && (
                        <span className="text-muted-foreground/60">Settled: {formatDate(m.completedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Milestone Value</span>
                      <span className="text-sm font-bold text-foreground">{m.amount ? formatCurrency(m.amount) : 'TBD'}</span>
                    </div>

                    {!m.isCompleted && project.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteMilestone(m._id)}
                        className="hover:border-primary hover:bg-primary/10 hover:text-primary rounded-xl"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-card text-card-foreground border border-border border-dashed rounded-2xl text-center text-muted-foreground text-sm shadow-sm">
                No milestones added to this project yet. Add one to track progress.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetailPage;
