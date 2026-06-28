import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';

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
        // Refresh details (status changes to 'sent' if it was 'draft')
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
        // Reset form
        setAmount('');
        setMethod('bank_transfer');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setReferenceNumber('');
        setShowPaymentForm(false);
        // Refresh details
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

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Invoice</h2>
            <p className="text-sm text-slate-400 mb-4">{error || 'Invoice not found'}</p>
            <Link to="/invoices" className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold">
              Return to Invoices List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const outstanding = Math.max(0, Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/invoices" className="hover:text-indigo-400 transition-colors">Invoices</Link>
          <span>/</span>
          <span className="text-slate-300 font-semibold">{invoice.invoiceNumber}</span>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-white">{invoice.invoiceNumber}</h1>
            <Badge status={invoice.status} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleSendEmail}
              disabled={emailLoading}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {emailLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {emailLoading ? 'Sending...' : 'Email Client'}
            </button>
          </div>
        </div>

        {emailSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 text-sm text-emerald-400">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
            </svg>
            <span>Invoice has been successfully emailed to the client!</span>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Invoice Summary and Line Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
              
              {/* Freelancer & Client details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Client Profile</span>
                  <span className="font-semibold text-slate-200 block">{invoice.clientId?.name}</span>
                  <span className="text-xs text-slate-400 block">{invoice.clientId?.company}</span>
                  <span className="text-xs text-slate-400 block">{invoice.clientId?.email}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Dates</span>
                  <span className="text-xs text-slate-400 block">Issued: {formatDate(invoice.issueDate)}</span>
                  <span className="text-xs text-slate-400 block font-semibold text-slate-200">Due: {formatDate(invoice.dueDate)}</span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="border-t border-slate-800/50 pt-6">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-3">Itemized Billings</span>
                <div className="overflow-hidden border border-slate-800/50 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-800 bg-slate-950/20 text-xs">
                    <thead>
                      <tr className="bg-slate-900/30 text-slate-400">
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-center w-16">Qty</th>
                        <th className="px-4 py-3 text-right w-24">Unit Price</th>
                        <th className="px-4 py-3 text-right w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50 text-slate-300">
                      {invoice.lineItems?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">{item.description}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-white">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-200">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({invoice.taxRate}%):</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-850 pt-2 text-base font-bold text-white">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Ledger tracking - payments & record payment form */}
          <div className="space-y-6">
            
            {/* Outstanding Balance card */}
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Outstanding Balance</span>
                <span className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(outstanding)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800/50 pt-4 text-slate-400">
                <div>
                  <span>Billed Total</span>
                  <span className="block font-semibold text-slate-200 mt-0.5">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="text-right">
                  <span>Amount Settled</span>
                  <span className="block font-semibold text-emerald-400 mt-0.5">{formatCurrency(invoice.amountPaid)}</span>
                </div>
              </div>

              {/* Payment recording button trigger */}
              {invoice.status !== 'paid' && (
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="w-full py-2.5 bg-slate-950 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 font-semibold rounded-xl text-xs transition-all duration-200"
                >
                  {showPaymentForm ? 'Cancel Payment Form' : 'Record Payment'}
                </button>
              )}
            </div>

            {/* Record Payment Form */}
            {showPaymentForm && (
              <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Record Payment Transaction</h3>
                
                {paymentError && (
                  <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    {paymentError}
                  </div>
                )}

                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Amount Paid (INR)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-sm text-white"
                      placeholder="e.g. 15000"
                      max={outstanding}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-300"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="paypal">PayPal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Reference / Trans. ID</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-sm text-white"
                      placeholder="TXN_998..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    {paymentLoading ? 'Logging...' : 'Confirm Transaction'}
                  </button>
                </form>
              </div>
            )}

            {/* Payments Ledger List */}
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-850 pb-2">Payments Ledger</span>
              
              <div className="space-y-3">
                {payments.length > 0 ? (
                  payments.map((pay) => (
                    <div key={pay._id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="block font-bold text-slate-200">{formatCurrency(pay.amount)}</span>
                        <span className="block text-slate-500 text-[10px] mt-0.5">
                          {pay.method.toUpperCase()} | {formatDate(pay.paymentDate)}
                        </span>
                        {pay.referenceNumber && (
                          <span className="block text-slate-600 text-[9px] font-mono mt-0.5">Ref: {pay.referenceNumber}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeletePayment(pay._id)}
                        className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-500/5 rounded transition-colors"
                        title="Delete payment record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="block text-center text-slate-500 text-xs py-4">No payments recorded yet.</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceDetailPage;
