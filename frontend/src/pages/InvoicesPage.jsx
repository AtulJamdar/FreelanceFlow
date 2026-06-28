import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [autoPopulate, setAutoPopulate] = useState(false);
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects?isArchived=false');
      if (response.data && response.data.success) {
        setProjects(response.data.data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err.message);
    }
  };

  const fetchInvoices = async () => {
    try {
      let queryParams = '?isArchived=false';
      if (filterStatus) queryParams += `&status=${filterStatus}`;

      const response = await api.get(`/invoices${queryParams}`);
      if (response.data && response.data.success) {
        setInvoices(response.data.data.invoices);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch invoices');
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await Promise.all([fetchProjects(), fetchInvoices()]);
      setLoading(false);
    };
    initPage();
  }, [filterStatus]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = lineItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'description' ? value : parseFloat(value) || 0
        };
      }
      return item;
    });
    setLineItems(updated);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const data = {
        projectId,
        dueDate,
        taxRate: parseFloat(taxRate) || 0,
        notes,
        autoPopulate
      };

      if (!autoPopulate) {
        data.lineItems = lineItems;
      }

      const response = await api.post('/invoices', data);

      if (response.data && response.data.success) {
        // Reset form
        setProjectId('');
        setDueDate('');
        setTaxRate('0');
        setNotes('');
        setAutoPopulate(false);
        setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        setShowModal(false);
        fetchInvoices(); // refresh list
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error?.message || 'Failed to create invoice');
    } finally {
      setFormLoading(false);
    }
  };

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
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">Generate invoices, collect payments, and log ledger stats</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 self-start sm:self-center flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl">
          <div className="overflow-x-auto rounded-xl border border-slate-800/50">
            <table className="min-w-full divide-y divide-slate-800 bg-slate-950/20">
              <thead>
                <tr className="bg-slate-900/30">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-900/10 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-400">
                        <Link to={`/invoices/${inv._id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {inv.clientId?.company || inv.clientId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {inv.projectId?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-white">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                      No invoices found. Generate an invoice to get paid.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative my-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Create New Invoice</h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Link Project
                    </label>
                    <select
                      required
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none"
                    >
                      <option value="">Select a Project...</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none"
                      placeholder="e.g. 18"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="autoPopulate"
                      checked={autoPopulate}
                      onChange={(e) => setAutoPopulate(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 rounded cursor-pointer"
                    />
                    <label htmlFor="autoPopulate" className="text-sm text-slate-300 cursor-pointer font-medium">
                      Auto-populate from completed milestones
                    </label>
                  </div>
                </div>

                {/* Manual line items editor (only if autoPopulate is false) */}
                {!autoPopulate && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Line Items</span>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[160px] overflow-y-auto border border-slate-800 p-3 rounded-xl bg-slate-950/40">
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            required
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white text-center"
                            placeholder="Qty"
                            min="1"
                          />
                          <input
                            type="number"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                            className="w-24 px-2 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white text-right"
                            placeholder="Price"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="text-rose-500 hover:text-rose-400 disabled:opacity-30 p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none resize-none"
                    placeholder="Custom notes, bank details, or terms"
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
                    {formLoading ? 'Creating...' : 'Create Invoice'}
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

export default InvoicesPage;
