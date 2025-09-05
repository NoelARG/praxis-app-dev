import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Auto-detect user's timezone
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
    console.log('Auto-detected timezone:', userTimezone);
  }, []);

  // Get user's detected timezone
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Comprehensive timezone list with auto-detected first
  const timezones = [
    { value: detectedTimezone, label: `${detectedTimezone} (Auto-detected)`, isDetected: true },
    // Filter out the detected timezone from the rest of the list to prevent duplicates
    ...[
      { value: 'Europe/Stockholm', label: 'Europe/Stockholm' },
      { value: 'Europe/London', label: 'Europe/London' },
      { value: 'Europe/Paris', label: 'Europe/Paris' },
      { value: 'Europe/Berlin', label: 'Europe/Berlin' },
      { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam' },
      { value: 'Europe/Copenhagen', label: 'Europe/Copenhagen' },
      { value: 'Europe/Oslo', label: 'Europe/Oslo' },
      { value: 'Europe/Helsinki', label: 'Europe/Helsinki' },
      { value: 'America/New_York', label: 'America/New_York (EST)' },
      { value: 'America/Chicago', label: 'America/Chicago (CST)' },
      { value: 'America/Denver', label: 'America/Denver (MST)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
      { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
      { value: 'Australia/Sydney', label: 'Australia/Sydney' },
      { value: 'UTC', label: 'UTC' },
    ].filter(tz => tz.value !== detectedTimezone) // Remove detected timezone from general list
  ];

  // Fixed timezone change handler to prevent duplicates
  const handleTimezoneChange = (selectedTimezone: string) => {
    console.log('🕐 Timezone selection attempted:', selectedTimezone);
    console.log('🕐 Current timezone state:', timezone);
    
    // Prevent duplicate selection
    if (selectedTimezone === timezone) {
      console.log('🕐 Timezone already selected, ignoring duplicate selection');
      return;
    }
    
    setTimezone(selectedTimezone);
    console.log('🕐 Timezone updated to:', selectedTimezone);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    // Length requirement (minimum 12 characters for strong password)
    if (password.length >= 12) score += 20;
    else if (password.length >= 8) score += 10;
    else feedback.push('At least 8 characters (12+ for strong)');

    // Lowercase letters
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Lowercase letter');

    // Uppercase letters
    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Uppercase letter');

    // Numbers
    if (/[0-9]/.test(password)) score += 20;
    else feedback.push('Number');

    // Special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    else feedback.push('Special character (!@#$%^&*)');

    let strength = 'Very Weak';
    let color = 'bg-red-500';
    
    if (score >= 20 && score < 40) {
      strength = 'Weak';
      color = 'bg-red-400';
    } else if (score >= 40 && score < 60) {
      strength = 'Fair';
      color = 'bg-yellow-500';
    } else if (score >= 60 && score < 80) {
      strength = 'Good';
      color = 'bg-blue-500';
    } else if (score >= 80) {
      strength = 'Strong';
      color = 'bg-emerald-500';
    }

    return { score, strength, color, feedback };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Format username (lowercase, alphanumeric + underscore only)
  const handleUsernameChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting signup process...');
    
    // Validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !username || !timezone) {
      console.log('❌ Validation failed: Missing fields');
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      console.log('❌ Validation failed: Username too short');
      toast({
        title: "Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match');
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength.score < 60) {
      console.log('❌ Validation failed: Password too weak');
      toast({
        title: "Error", 
        description: "Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ All validations passed');
    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      const signupData = {
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
            username: username.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            timezone: timezone
          }
        }
      };

      console.log('📤 Calling signUp with data:', {
        email: signupData.email,
        password: '***',
        metadata: signupData.options.data
      });

      // Call the signUp function from AuthContext
      const result = await signUp(
        signupData.email, 
        signupData.password, 
        signupData.options.data
      );

      console.log('📨 SignUp response:', result);

      if (result.error) {
        console.error('❌ Signup error:', result.error);
        toast({
          title: "Signup Failed",
          description: result.error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (result.user) {
        console.log('✅ User created successfully:', result.user);
        
        // Check if user needs email confirmation
        if (result.user && !result.user.email_confirmed_at) {
          console.log('📧 Email confirmation required');
          setEmailSent(true);
                     toast({
             title: "Check Your Email",
             description: `We've sent a confirmation link to ${email}. Please check your email and click the link to activate your account.`,
             duration: 10000,
             className: "bg-zinc-700 border-zinc-600 text-zinc-100",
           });
          // Don't redirect - stay on this page to show email confirmation state
          return;
        }

        // User is confirmed, proceed to app
        console.log('🎉 Account created and confirmed - proceeding to app');
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        
        // Start transition animation
        setIsTransitioning(true);
        
        // Navigate to Today page
        setTimeout(() => {
          console.log('🚀 Navigating to /today');
          navigate('/today');
        }, 600);
      } else {
        console.error('❌ No user returned from signUp');
        toast({
          title: "Error",
          description: "Account creation failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Unexpected signup error:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  // If email was sent, show confirmation state
  if (emailSent) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-zinc-800 border-zinc-700/50 shadow-lg shadow-zinc-900/20">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-medium title-gradient">
              Check Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 text-center">
            <p className="text-zinc-300 mb-6 leading-relaxed">
              We've sent a confirmation link to <strong className="text-zinc-100">{email}</strong>
            </p>
            <p className="text-zinc-400 text-sm mb-8">
              Please check your email and click the confirmation link to activate your account. 
              After confirming, you can log in to Life Alchemy.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleLoginClick}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-11"
              >
                Go to Login Page
              </Button>
              
              <Button 
                onClick={() => setEmailSent(false)}
                variant="ghost"
                className="w-full text-zinc-400 hover:text-zinc-300"
              >
                ← Back to Signup
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-700">
              <p className="text-xs text-zinc-500">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className={`transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
        <Card className="w-full max-w-lg bg-zinc-800 border-zinc-700/50 shadow-lg shadow-zinc-900/20">
          <CardHeader className="text-center pb-8 pt-10">
            <CardTitle className="text-2xl font-medium title-gradient">
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-zinc-300 text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-zinc-300 text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11"
                  required
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300 text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="johndoe"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11"
                  minLength={3}
                  pattern="[a-z0-9_]+"
                  title="Username can only contain lowercase letters, numbers, and underscores"
                  required
                />
                <p className="text-xs text-zinc-500">
                  3+ characters, letters/numbers/underscores only (for future friend features)
                </p>
              </div>

              {/* Timezone Field */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-zinc-300 text-sm font-medium">
                  Timezone
                </Label>
                <Select value={timezone} onValueChange={handleTimezoneChange} required>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-100 focus:border-zinc-500 h-11">
                    <SelectValue placeholder="Select your timezone">
                      {timezone === detectedTimezone ? 
                        `${timezone} (Auto-detected)` : 
                        timezone
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-700 border-zinc-600 text-zinc-100 max-h-60">
                    {timezones.map((tz) => (
                      <SelectItem 
                        key={tz.value} 
                        value={tz.value}
                        className={`hover:bg-zinc-600 focus:bg-zinc-600 hover:text-zinc-100 focus:text-zinc-100 data-[highlighted]:bg-zinc-600 data-[highlighted]:text-zinc-100 ${
                          tz.isDetected ? 'text-emerald-400 hover:text-emerald-300' : ''
                        }`}
                      >
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 'Strong' ? 'text-emerald-400' :
                        passwordStrength.strength === 'Good' ? 'text-blue-400' :
                        passwordStrength.strength === 'Fair' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        Missing: {passwordStrength.feedback.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center space-x-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-11"
                  disabled={isLoading || passwordStrength.score < 60 || !passwordsMatch}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              {/* Terms & Privacy */}
              <div className="text-center pt-2">
                <p className="text-xs text-zinc-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and secure.
                </p>
              </div>

              {/* Login Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;