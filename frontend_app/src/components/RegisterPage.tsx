import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { JobJourneyLogo } from './JobJourneyLogo';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  AlertCircle,
  Briefcase,
  MapPin,
  Phone
} from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onRegister: (userData: any) => void;
  onLogin: () => void;
}

type ServerRegisterSuccess = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profile?: any;
};

type ServerError = {
  error?: { code?: string; message?: string };
  message?: string;
};

const API_BASE = 'http://localhost:4000';

export function RegisterPage({ onBack, onRegister, onLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    experience: '', // maps to seniorityLevel: "intern" | "junior" | "mid" | "senior" | "lead"
    location: '',
    preferredLocation: '',
    mobile: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string>('');
  const [step, setStep] = useState(1);

  // ---------- Helpers ----------
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }
    // Step 2 is optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build payload that matches auth.routes.ts registerSchema
  const buildRegisterPayload = () => {
    const targetRoles =
      formData.jobTitle.trim()
        ? formData.jobTitle.split(',').map(r => r.trim()).filter(Boolean)
        : undefined;

    const preferredLocations =
      formData.preferredLocation.trim()
        ? [formData.preferredLocation.trim()]
        : undefined;

    const seniorityLevel = (formData.experience || undefined) as
      | 'intern'
      | 'junior'
      | 'mid'
      | 'senior'
      | 'lead'
      | undefined;

    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.mobile.trim() || undefined,
      location: formData.location.trim() || undefined,
      targetRoles,
      seniorityLevel,
      preferredLocations
    };
  };

  // ---------- Handlers ----------
  const handleNext = () => {
    setApiError('');
    if (validateForm()) setStep(2);
  };

  const registerRequest = async () => {
    const payload = buildRegisterPayload();

    // ✅ capture the response as `res`
    const res = await fetch(`${API_BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // credentials: 'include', // uncomment only if you actually use cookies
    });

    // defensively parse JSON (server returns JSON on 201)
    let data: (ServerRegisterSuccess & ServerError) | null = null;
    try {
      data = (await res.json()) as ServerRegisterSuccess & ServerError;
    } catch {
      // ignore parse error for non-JSON responses
    }

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        data?.message ||
        (res.status === 409 ? 'Email already used' : `Registration failed (HTTP ${res.status})`);
      throw new Error(msg);
    }

    // Persist tokens (optional)
    try {
      if (data && 'accessToken' in data) {
        localStorage.setItem('accessToken', (data as ServerRegisterSuccess).accessToken);
        localStorage.setItem('refreshToken', (data as ServerRegisterSuccess).refreshToken);
      }
    } catch {
      /* storage may be unavailable */
    }

    return data as ServerRegisterSuccess;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await registerRequest();
      setIsLoading(false);
      onRegister?.(result);
    } catch (err: any) {
      setIsLoading(false);
      setApiError(err?.message || 'Something went wrong');
    }
  };

  const handleSkipStep2 = async () => {
    setApiError('');
    setIsLoading(true);
    try {
      const result = await registerRequest();
      setIsLoading(false);
      onRegister?.(result);
    } catch (err: any) {
      setIsLoading(false);
      setApiError(err?.message || 'Something went wrong');
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? 'Back to Home' : 'Previous Step'}
          </Button>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <JobJourneyLogo size="lg" showText={true} />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {step === 1 ? 'Create your account' : 'Tell us about yourself'}
              </h1>
              <p className="text-muted-foreground">
                {step === 1
                  ? 'Join thousands of professionals advancing their careers'
                  : 'Help us personalize your experience (optional)'}
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center">Step {step} of 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Error Banner */}
              {apiError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {step === 1 ? (
                <>
                  {/* Basic Information Form */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={e => updateFormData('firstName', e.target.value)}
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.firstName && (
                          <div className="flex items-center gap-1 text-sm text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={e => updateFormData('lastName', e.target.value)}
                          disabled={isLoading}
                        />
                        {errors.lastName && (
                          <div className="flex items-center gap-1 text-sm text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={e => updateFormData('email', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={e => updateFormData('password', e.target.value)}
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
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${getStrengthColor(
                                  passwordStrength(formData.password)
                                )}`}
                                style={{
                                  width: `${(passwordStrength(formData.password) / 5) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getStrengthText(passwordStrength(formData.password))}
                            </span>
                          </div>
                        </div>
                      )}
                      {errors.password && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={e => updateFormData('confirmPassword', e.target.value)}
                          className="pl-10 pr-10"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={checked => updateFormData('agreeToTerms', checked as boolean)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the{' '}
                            <Button type="button" variant="link" className="px-0 h-auto text-sm">
                              Terms of Service
                            </Button>{' '}
                            and{' '}
                            <Button type="button" variant="link" className="px-0 h-auto text-sm">
                              Privacy Policy
                            </Button>
                          </Label>
                        </div>
                      </div>
                      {errors.agreeToTerms && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.agreeToTerms}
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="subscribeNewsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={checked =>
                            updateFormData('subscribeNewsletter', checked as boolean)
                          }
                          disabled={isLoading}
                        />
                        <Label htmlFor="subscribeNewsletter" className="text-sm">
                          Subscribe to our newsletter for career tips and updates
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      Continue to Step 2
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  {/* Professional Information Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4 p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          These details help us personalize your experience
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkipStep2}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Skip for now - Create Account
                        </Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                              Or complete your profile
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">
                        Target Roles{' '}
                        <span className="text-muted-foreground text-xs">(optional — comma separated)</span>
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="jobTitle"
                          placeholder="e.g., Software Engineer, Frontend Developer"
                          value={formData.jobTitle}
                          onChange={e => updateFormData('jobTitle', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">
                        Experience Level <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Select
                        value={formData.experience}
                        onValueChange={value => updateFormData('experience', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Must match backend enum: intern | junior | mid | senior | lead */}
                          <SelectItem value="intern">Intern</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        Location <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="e.g., Dhaka, Bangladesh"
                          value={formData.location}
                          onChange={e => updateFormData('location', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation">
                        Preferred Location <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="preferredLocation"
                          placeholder="e.g., Remote or New York, NY"
                          value={formData.preferredLocation}
                          onChange={e => updateFormData('preferredLocation', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Mobile (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="mobile">
                        Mobile <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="e.g., +880 115 555 0123"
                          value={formData.mobile}
                          onChange={e => updateFormData('mobile', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                  </form>
                </>
              )}

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button variant="link" className="px-0 font-semibold" onClick={onLogin} disabled={isLoading}>
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              By creating an account, you agree to our{' '}
              <Button type="button" variant="link" className="px-0 text-xs">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button type="button" variant="link" className="px-0 text-xs">
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
