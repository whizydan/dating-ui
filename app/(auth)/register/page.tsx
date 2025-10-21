'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, Heart, Sparkles, MapPin, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Profile Details
    age: '',
    gender: '',
    city: '',
    country: '',
    whatsappNumber: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.age || parseInt(formData.age) < 18) {
      setError('You must be at least 18 years old');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }
    if (!formData.whatsappNumber.trim()) {
      setError('WhatsApp number is required');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleRegister();
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
    setError('');
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in profiles table with all details
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: formData.fullName.toLowerCase().replace(/\s+/g, '_'),
              full_name: formData.fullName,
              age: parseInt(formData.age),
              gender: formData.gender,
              city: formData.city,
              country: formData.country,
              whatsapp_number: formData.whatsappNumber,
              bio: formData.bio,
              avatar_url: null,
              quirks: [],
              profile_completed: true,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) throw profileError;

        // If email confirmation is required, show message
        if (!authData.session) {
          alert('Registration successful! Please check your email for verification link.');
          router.push('/login');
        } else {
          // If auto-confirmed, redirect to discover
          router.push('/discover');
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join Quirk Dating
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {step === 1 ? 'Create your account' : 'Complete your profile'}
              </CardDescription>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    stepNumber === step
                      ? 'bg-purple-500'
                      : stepNumber < step
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password (min. 6 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 border-gray-300 focus:border-purple-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 pr-10 border-gray-300 focus:border-purple-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Profile Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-gray-700">Age *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          placeholder="Age"
                          min="18"
                          max="100"
                          value={formData.age}
                          onChange={handleChange}
                          className="pl-10 border-gray-300 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-gray-700">Gender *</Label>
                      <Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender}>
                        <SelectTrigger className="border-gray-300 focus:border-purple-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700">City *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleChange}
                          className="pl-10 border-gray-300 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-gray-700">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="text-gray-700">WhatsApp Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="whatsappNumber"
                        name="whatsappNumber"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-purple-500"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be used for connections to chat with you directly
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell others about yourself and your quirks..."
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <div className={`flex ${step === 2 ? 'justify-between' : 'justify-end'}`}>
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                )}
                
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {step === 1 ? 'Continuing...' : 'Creating Account...'}
                    </motion.div>
                  ) : (
                    step === 1 ? 'Continue' : 'Create Account'
                  )}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleSignUp}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}