import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');

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
      if (filterStatus) queryParams += `&status=${filterStatus}`;
      if (filterClient) queryParams += `&clientId=${filterClient}`;

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
        // Reset form
        setTitle('');
        setDescription('');
        setClientId('');
        setStartDate('');
        setDeadline('');
        setTotalBudget('');
        setShowModal(false);
        fetchProjects(); // refresh list
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
        fetchProjects(); // refresh list
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Projects</h1>
            <p className="text-sm text-slate-500 mt-1">Track deliverables, deadlines, and milestones</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 self-start sm:self-center flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-sm text-red-400">
            <svg className="w-5 h-5 flex-shrink-0 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Filter controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 text-sm outline-none transition-colors w-full min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Filter by Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 text-sm outline-none transition-colors w-full min-w-[200px]"
            >
              <option value="">All Clients</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="text-xs text-slate-500 font-mono">
                      {proj.clientId?.company || proj.clientId?.name}
                    </span>
                    <Badge status={proj.status} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    <Link to={`/projects/${proj._id}`} className="hover:underline">
                      {proj.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-slate-400 line-clamp-2 mb-6">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-slate-800/50 pt-4 space-y-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Budget</span>
                      <span className="font-semibold text-slate-200">{proj.totalBudget ? formatCurrency(proj.totalBudget) : 'TBD'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Deadline</span>
                      <span className="font-semibold text-slate-200">{formatDate(proj.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4 pt-2">
                    <Link
                      to={`/projects/${proj._id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      Milestones
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    {/* Quick status change selector */}
                    {proj.status !== 'completed' && (
                      <select
                        value={proj.status}
                        onChange={(e) => handleStatusChange(proj._id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 bg-slate-900/20 border border-slate-800/80 border-dashed rounded-2xl text-center text-slate-500 text-sm">
              No projects found matching the filters. Create a new project to get started.
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
                    placeholder="E-Commerce Redesign"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors resize-none"
                    placeholder="Short description of deliverables"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Assign Client
                  </label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none transition-colors"
                  >
                    <option value="">Select a Client...</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Deadline Date
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Total Project Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    {formLoading ? 'Saving...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
