import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';

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
        // Reset form
        setTitle('');
        setDescription('');
        setAmount('');
        setDueDate('');
        setShowForm(false);
        // Refresh details & milestones list
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

  // Calculate project financial metrics
  const completedMilestonesAmount = milestones
    .filter(m => m.isCompleted)
    .reduce((sum, m) => sum + (m.amount || 0), 0);

  const totalMilestonesAmount = milestones
    .reduce((sum, m) => sum + (m.amount || 0), 0);

  // Compute progress bar width
  const progressPercent = milestones.length > 0 
    ? Math.round((milestones.filter(m => m.isCompleted).length / milestones.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Project</h2>
            <p className="text-sm text-slate-400 mb-4">{error || 'Project not found'}</p>
            <Link to="/projects" className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold">
              Return to Projects List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/projects" className="hover:text-indigo-400 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-slate-300 font-semibold truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Project Header Info */}
        <div className="p-6 sm:p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge status={project.status} />
                <span className="text-xs text-slate-500 font-mono">Client: {project.clientId?.company || project.clientId?.name}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">{project.title}</h1>
              <p className="text-sm text-slate-400 mt-2 max-w-3xl">{project.description || 'No description provided.'}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 self-start min-w-[200px] text-right space-y-1">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Total Project Budget</span>
              <span className="block text-2xl font-extrabold text-white">{project.totalBudget ? formatCurrency(project.totalBudget) : 'TBD'}</span>
            </div>
          </div>

          {/* Dates & Metrics details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-b border-slate-800/50 py-6 text-sm text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Timeline</span>
              <span className="font-semibold text-slate-200">{formatDate(project.startDate)} — {formatDate(project.deadline)}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Milestones Completed</span>
              <span className="font-semibold text-slate-200">
                {milestones.filter(m => m.isCompleted).length} / {milestones.length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Invoiced Progress</span>
              <span className="font-semibold text-slate-200">
                {formatCurrency(completedMilestonesAmount)} / {formatCurrency(totalMilestonesAmount)}
              </span>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Overall Deliverable Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              Project Milestones
            </h2>
            {project.status !== 'completed' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {showForm ? 'Cancel' : 'Add Milestone'}
              </button>
            )}
          </div>

          {/* Milestone Add Form */}
          {showForm && (
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl max-w-xl">
              <h3 className="text-lg font-bold text-white mb-4">Add Project Milestone</h3>
              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {formError}
                </div>
              )}
              <form onSubmit={handleCreateMilestone} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none"
                    placeholder="Milestone 1: Scaffold Directory Structures"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none resize-none"
                    placeholder="Deliverables included..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Billing Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none"
                      placeholder="e.g. 20000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  {formLoading ? 'Saving...' : 'Add Milestone'}
                </button>
              </form>
            </div>
          )}

          {/* Milestones Card list */}
          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((m) => (
                <div
                  key={m._id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    m.isCompleted
                      ? 'bg-slate-950/20 border-slate-900/50 opacity-75'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-white text-base">{m.title}</h4>
                      {m.isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                    {m.description && <p className="text-xs text-slate-400 max-w-xl">{m.description}</p>}
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-mono">
                      <span>Due: {formatDate(m.dueDate)}</span>
                      {m.isCompleted && m.completedAt && (
                        <span className="text-slate-600">Settled: {formatDate(m.completedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 border-slate-800/50 pt-3 sm:pt-0">
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Milestone Value</span>
                      <span className="text-sm font-bold text-slate-200">{m.amount ? formatCurrency(m.amount) : 'TBD'}</span>
                    </div>

                    {!m.isCompleted && project.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteMilestone(m._id)}
                        className="px-4 py-2 border border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold transition-all duration-200"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-slate-900/10 border border-slate-800 border-dashed rounded-2xl text-center text-slate-500 text-sm">
                No milestones added to this project yet. Add one to track progress.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
