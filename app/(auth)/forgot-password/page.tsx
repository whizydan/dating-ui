'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'success'>('email');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
      setStep('success');
    } catch (error: any) {
      setError(error.message || 'An error occurred while sending reset email');
    } finally {
      setLoading(false);
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
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {step === 'email' ? 'Reset Password' : 'Check Your Email'}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {step === 'email' 
                  ? 'Enter your email to receive a password reset link' 
                  : 'We sent a reset link to your email'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 'email' ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all duration-200"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link 
                    href="/login" 
                    className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-6"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-purple-600">{email}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-900">What's Next?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check your inbox for an email from Quirk Dating</li>
                        <li>• Click the reset link in the email</li>
                        <li>• Create your new password</li>
                        <li>• Sign in with your new credentials</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setStep('email');
                      setEmail('');
                      setSuccess(false);
                    }}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send to a Different Email
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Back to{' '}
                    <Link 
                      href="/login" 
                      className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Notice */}
            {step === 'email' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900">Security Notice</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      The reset link will expire in 24 hours for your security. 
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}