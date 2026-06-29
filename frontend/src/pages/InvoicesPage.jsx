import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { AlertCircle, FileText, Plus, Trash2 } from 'lucide-react';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');

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
      if (filterStatus && filterStatus !== 'ALL') queryParams += `&status=${filterStatus}`;

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
        setProjectId('');
        setDueDate('');
        setTaxRate('0');
        setNotes('');
        setAutoPopulate(false);
        setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        setShowModal(false);
        fetchInvoices();
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
    <DashboardLayout title="Invoices">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate invoices, collect payments, and log ledger stats</p>
          </div>

          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="font-semibold flex items-center gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Create New Invoice
                </DialogTitle>
              </DialogHeader>

              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Link Project
                    </Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger className="rounded-xl border border-border bg-background text-foreground">
                        <SelectValue placeholder="Select a Project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dueDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="taxRate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tax Rate (%)
                    </Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="e.g. 18"
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="autoPopulate"
                      checked={autoPopulate}
                      onChange={(e) => setAutoPopulate(e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded cursor-pointer"
                    />
                    <label htmlFor="autoPopulate" className="text-sm text-foreground cursor-pointer font-medium">
                      Auto-populate from completed milestones
                    </label>
                  </div>
                </div>

                {/* Manual line items editor */}
                {!autoPopulate && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Line Items</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddLineItem}
                        className="text-xs text-primary hover:text-primary/80 font-semibold"
                      >
                        + Add Item
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[160px] overflow-y-auto border border-border p-3 rounded-xl bg-background/50">
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-background"
                            placeholder="Description"
                          />
                          <Input
                            type="number"
                            required
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                            className="w-16 rounded-lg border border-border bg-background text-center"
                            placeholder="Qty"
                            min="1"
                          />
                          <Input
                            type="number"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                            className="w-24 rounded-lg border border-border bg-background text-right"
                            placeholder="Price"
                            min="0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="invoiceNotes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Invoice Notes
                  </Label>
                  <textarea
                    id="invoiceNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary/80 rounded-xl text-foreground text-sm outline-none resize-none"
                    placeholder="Custom notes, bank details, or terms"
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
                    {formLoading ? 'Creating...' : 'Create Invoice'}
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

        {/* Filter controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
          <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[160px]">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="rounded-xl border border-border bg-background text-foreground h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="p-6 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
          <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground">Invoice No</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground">Client</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground">Project</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground">Due Date</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground text-right">Amount</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <TableRow key={inv._id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-primary">
                        <Link to={`/invoices/${inv._id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {inv.clientId?.company || inv.clientId?.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {inv.projectId?.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getInvoiceBadgeVariant(inv.status)}>
                          {inv.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="h-32 text-center text-sm text-muted-foreground">
                      No invoices found. Generate an invoice to get paid.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoicesPage;
