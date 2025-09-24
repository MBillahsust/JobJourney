import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { JobJourneyLogo } from './JobJourneyLogo';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  Chrome,
  Linkedin,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
}

export function LoginPage({ onBack, onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email, password);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      onLogin(`demo@${provider}.com`, `${provider}-oauth`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <JobJourneyLogo size="lg" showText={true} />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue your career journey
              </p>
            </div>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center">Sign In</CardTitle>
              <p className="text-center text-muted-foreground text-sm">
                Choose your preferred sign-in method
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4 mr-2 text-blue-600" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={isLoading}
                >
                  <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                  Continue with LinkedIn
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Email and Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm">
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button
                  variant="link"
                  className="px-0 font-semibold"
                  onClick={onRegister}
                  disabled={isLoading}
                >
                  Sign up for free
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/20">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Demo Credentials</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Email: demo@jobjourney.com</p>
                  <p>Password: demo123</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail('demo@jobjourney.com');
                    setPassword('demo123');
                  }}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Use Demo Credentials
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              By signing in, you agree to our{' '}
              <Button variant="link" className="px-0 text-xs">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant="link" className="px-0 text-xs">
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}