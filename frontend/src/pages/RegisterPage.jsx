import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password, businessName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md shadow-lg border border-border relative z-10 bg-card text-card-foreground rounded-2xl my-8">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto inline-flex items-center justify-center p-3 mb-3 bg-primary/10 border border-primary/20 rounded-2xl">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">Get Started</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">Register as a freelancer on FreelanceFlow</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 text-xs text-destructive font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="regName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="regName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="rounded-xl border border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regEmail" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="regEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regBus" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business Name
              </Label>
              <Input
                id="regBus"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="JD Consulting"
                className="rounded-xl border border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regPass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="regPass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="rounded-xl border border-border bg-background text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl font-semibold shadow-sm transition-colors mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline transition-colors">
              Log in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
