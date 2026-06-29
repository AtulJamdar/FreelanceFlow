import React, { useState, useEffect } from 'react';
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
import { AlertCircle, UserPlus, Phone, Briefcase, Plus } from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients?isArchived=false');
      if (response.data && response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const response = await api.post('/clients', {
        name,
        email,
        company,
        phone,
        address,
        notes
      });

      if (response.data && response.data.success) {
        setName('');
        setEmail('');
        setCompany('');
        setPhone('');
        setAddress('');
        setNotes('');
        setShowModal(false);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error?.message || 'Failed to create client');
    } finally {
      setFormLoading(false);
    }
  };

  const handleArchiveClient = async (id) => {
    if (!window.confirm('Are you sure you want to archive this client?')) return;
    setError(null);

    try {
      const response = await api.delete(`/clients/${id}`);
      if (response.data && response.data.success) {
        fetchClients();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to archive client. Make sure there are no active projects.');
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
    <DashboardLayout title="Clients">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your client directory profiles</p>
          </div>

          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="font-semibold flex items-center gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  New Client Profile
                </DialogTitle>
              </DialogHeader>

              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateClient} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="clientName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Client Name
                    </Label>
                    <Input
                      id="clientName"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="clientEmail" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="clientCompany" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company
                    </Label>
                    <Input
                      id="clientCompany"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Inc."
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="clientPhone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="clientPhone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-9988..."
                      className="rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientAddress" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address
                  </Label>
                  <Input
                    id="clientAddress"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Physical billing address"
                    className="rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientNotes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </Label>
                  <textarea
                    id="clientNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary/80 rounded-xl text-foreground text-sm outline-none transition-colors resize-none"
                    placeholder="Billing preferences or notes"
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
                    {formLoading ? 'Saving...' : 'Save Profile'}
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

        {/* Clients Table Card */}
        <div className="p-6 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
          <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length > 0 ? (
                  clients.map((cli) => (
                    <TableRow key={cli._id} className="hover:bg-muted/30">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                        {cli.name}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {cli.company || '—'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {cli.email}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {cli.phone || '—'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveClient(cli._id)}
                          className="hover:border-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg border-border"
                        >
                          Archive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="h-32 text-center text-sm text-muted-foreground">
                      No clients found. Add a client to start recording projects.
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

export default ClientsPage;
