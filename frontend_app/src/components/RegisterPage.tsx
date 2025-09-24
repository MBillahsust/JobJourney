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
  CheckCircle,
  Briefcase,
  MapPin
} from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onRegister: (userData: any) => void;
  onLogin: () => void;
}

export function RegisterPage({ onBack, onRegister, onLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    experience: '',
    location: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState(1);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

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
    // Step 2 validation removed - all fields are optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onRegister(formData);
    }, 1500);
  };

  const handleSkipStep2 = () => {
    setIsLoading(true);
    // Complete registration without step 2 data
    setTimeout(() => {
      setIsLoading(false);
      onRegister(formData);
    }, 1000);
  };



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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
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
                  : 'Help us personalize your experience (optional)'
                }
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center">
                Step {step} of 2
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 ? (
                <>
                  {/* Basic Information Form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
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
                          onChange={(e) => updateFormData('lastName', e.target.value)}
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
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
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
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => updateFormData('password', e.target.value)}
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
                                className={`h-full transition-all ${getStrengthColor(passwordStrength(formData.password))}`}
                                style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
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
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
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
                          onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the{' '}
                            <Button variant="link" className="px-0 h-auto text-sm">
                              Terms of Service
                            </Button>{' '}
                            and{' '}
                            <Button variant="link" className="px-0 h-auto text-sm">
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
                          onCheckedChange={(checked) => updateFormData('subscribeNewsletter', checked as boolean)}
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
                      <Label htmlFor="jobTitle">Current Job Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="jobTitle"
                          placeholder="e.g., Software Engineer"
                          value={formData.jobTitle}
                          onChange={(e) => updateFormData('jobTitle', e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Select 
                        value={formData.experience} 
                        onValueChange={(value) => updateFormData('experience', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (5-8 years)</SelectItem>
                          <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                          <SelectItem value="executive">Executive/C-Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="e.g., San Francisco, CA"
                          value={formData.location}
                          onChange={(e) => updateFormData('location', e.target.value)}
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
                <Button
                  variant="link"
                  className="px-0 font-semibold"
                  onClick={onLogin}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              By creating an account, you agree to our{' '}
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