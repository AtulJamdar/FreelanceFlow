import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
  Plus,
  Trash2,
  DollarSign,
  Briefcase
} from 'lucide-react';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email state
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Record Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      if (response.data && response.data.success) {
        setInvoice(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch invoice details');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/invoices/${id}/payments`);
      if (response.data && response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load invoice payments:', err.message);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await Promise.all([fetchInvoiceDetails(), fetchPayments()]);
      setLoading(false);
    };
    initPage();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF document.');
    }
  };

  const handleSendEmail = async () => {
    setEmailLoading(true);
    setEmailSuccess(false);
    try {
      const response = await api.post(`/invoices/${id}/send`);
      if (response.data && response.data.success) {
        setEmailSuccess(true);
        await fetchInvoiceDetails();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'SMTP delivery failed');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      const response = await api.post(`/invoices/${id}/payments`, {
        amount: parseFloat(amount),
        method,
        paymentDate: new Date(paymentDate).toISOString(),
        referenceNumber: referenceNumber || undefined
      });

      if (response.data && response.data.success) {
        setAmount('');
        setMethod('bank_transfer');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setReferenceNumber('');
        setShowPaymentForm(false);
        await Promise.all([fetchInvoiceDetails(), fetchPayments()]);
      }
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reverse this payment transaction?')) return;

    try {
      const response = await api.delete(`/payments/${paymentId}`);
      if (response.data && response.data.success) {
        await Promise.all([fetchInvoiceDetails(), fetchPayments()]);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to delete payment record');
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

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <Card className="max-w-md p-6 border border-destructive/20 rounded-2xl text-center bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error Loading Invoice
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{error || 'Invoice not found'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link to="/invoices">
              <Button variant="outline" className="rounded-xl">Return to Invoices List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const outstanding = Math.max(0, Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100);

  return (
    <DashboardLayout title="Invoice Profile">
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/40 pb-2">
          <Link to="/invoices" className="hover:text-primary transition-colors">Invoices</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">{invoice.invoiceNumber}</span>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{invoice.invoiceNumber}</h1>
            <Badge variant={getInvoiceBadgeVariant(invoice.status)}>
              {invoice.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="font-semibold flex items-center gap-1.5 rounded-xl border-border"
            >
              <Download className="w-4 h-4 text-primary" />
              Download PDF
            </Button>

            <Button
              onClick={handleSendEmail}
              disabled={emailLoading}
              className="font-semibold flex items-center gap-1.5 rounded-xl"
            >
              {emailLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {emailLoading ? 'Sending...' : 'Email Client'}
            </Button>
          </div>
        </div>

        {emailSuccess && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3 text-sm text-primary font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Invoice has been successfully emailed to the client!</span>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Invoice Summary and Line Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-6">
                
                {/* Freelancer & Client details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-b border-border/40 pb-6">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-bold mb-1">Client Profile</span>
                    <span className="font-bold text-foreground block">{invoice.clientId?.name}</span>
                    <span className="text-xs block">{invoice.clientId?.company}</span>
                    <span className="text-xs block">{invoice.clientId?.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider font-bold mb-1">Timeline</span>
                    <span className="text-xs block">Issued: {formatDate(invoice.issueDate)}</span>
                    <span className="text-xs block font-semibold text-foreground mt-0.5">Due: {formatDate(invoice.dueDate)}</span>
                  </div>
                </div>

                {/* Itemized Line Items Table */}
                <div className="space-y-3">
                  <span className="block text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">Itemized Billings</span>
                  <div className="overflow-hidden border border-border rounded-xl">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="px-4 py-3 text-left font-bold text-xs uppercase text-muted-foreground">Description</TableHead>
                          <TableHead className="px-4 py-3 text-center w-16 font-bold text-xs uppercase text-muted-foreground">Qty</TableHead>
                          <TableHead className="px-4 py-3 text-right w-24 font-bold text-xs uppercase text-muted-foreground">Unit Price</TableHead>
                          <TableHead className="px-4 py-3 text-right w-24 font-bold text-xs uppercase text-muted-foreground">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-foreground">
                        {invoice.lineItems?.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-bold text-foreground">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <div className="w-64 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({invoice.taxRate}%):</span>
                        <span className="font-semibold text-foreground">{formatCurrency(invoice.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Ledger tracking - payments & record payment form */}
          <div className="space-y-6">
            
            {/* Outstanding Balance card */}
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Outstanding Balance</span>
                  <span className="text-3xl font-extrabold text-foreground tracking-tight mt-0.5 block">{formatCurrency(outstanding)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4 text-muted-foreground">
                  <div>
                    <span>Billed Total</span>
                    <span className="block font-bold text-foreground mt-0.5">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span>Amount Settled</span>
                    <span className="block font-bold text-primary mt-0.5">{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                </div>

                {/* Payment recording button trigger */}
                {invoice.status !== 'paid' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="w-full font-semibold rounded-xl border-border"
                  >
                    {showPaymentForm ? 'Cancel Payment' : 'Record Payment'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Record Payment Form */}
            {showPaymentForm && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Record Payment Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentError && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="payAmount" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount Paid (INR)</Label>
                      <Input
                        id="payAmount"
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-lg border border-border bg-background"
                        placeholder="e.g. 15000"
                        max={outstanding}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="rounded-lg border border-border bg-background text-foreground h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="payDate" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Date</Label>
                      <Input
                        id="payDate"
                        type="date"
                        required
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="rounded-lg border border-border bg-background text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="payRef" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reference / Trans. ID</Label>
                      <Input
                        id="payRef"
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="rounded-lg border border-border bg-background"
                        placeholder="TXN_998..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full rounded-xl"
                    >
                      {paymentLoading ? 'Logging...' : 'Confirm Transaction'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payments Ledger List */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Payments Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {payments.length > 0 ? (
                  payments.map((pay) => (
                    <div key={pay._id} className="p-3 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="block font-bold text-foreground">{formatCurrency(pay.amount)}</span>
                        <span className="block text-muted-foreground text-[10px] mt-0.5">
                          {pay.method.toUpperCase()} | {formatDate(pay.paymentDate)}
                        </span>
                        {pay.referenceNumber && (
                          <span className="block text-muted-foreground/60 text-[9px] font-mono mt-0.5">Ref: {pay.referenceNumber}</span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePayment(pay._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        title="Delete payment record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <span className="block text-center text-muted-foreground text-xs py-4">No payments recorded yet.</span>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceDetailPage;
