
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react';
import GuestAuth from '../components/GuestAuth';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onGuestSuccess?: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onGuestSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showGuestAuth, setShowGuestAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onAuthSuccess(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        onAuthSuccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    if (!isLogin && !username.trim()) {
      toast({
        variant: "destructive",
        title: "Username Required",
        description: "Please choose a username.",
      });
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('Login error:', error);
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message.includes('Invalid login credentials') 
              ? "Invalid email or password. Please check your credentials." 
              : error.message,
          });
        } else if (data.user) {
          console.log('Login successful for:', data.user.email);
          toast({
            title: "Welcome back!",
            description: "You've been successfully logged in.",
          });
          onAuthSuccess(data.user);
        }
      } else {
        // Sign up flow
        console.log('Attempting signup for:', email, 'with username:', username);
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim()
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          
          if (error.message.includes('User already registered')) {
            toast({
              variant: "destructive",
              title: "Account Already Exists",
              description: "An account with this email already exists. Please try logging in instead.",
            });
            setIsLogin(true);
          } else if (error.message.includes('duplicate key value violates unique constraint')) {
            toast({
              variant: "destructive",
              title: "Username Taken",
              description: "This username is already taken. Please choose a different one.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup Failed",
              description: error.message,
            });
          }
        } else if (data.user) {
          console.log('Signup successful for:', data.user.email);
          
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed
            toast({
              title: "Account Created!",
              description: "Welcome to Today I Learned! You're now logged in.",
            });
            onAuthSuccess(data.user);
          } else {
            // Email confirmation required
            toast({
              title: "Almost Done!",
              description: "Please check your email and click the confirmation link to complete your registration.",
            });
            setIsLogin(true);
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to authentication service. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setShowGuestAuth(true);
  };

  const handleGuestSuccess = (user: any) => {
    if (onGuestSuccess) {
      onGuestSuccess(user);
    }
  };

  if (showGuestAuth) {
    return (
      <GuestAuth
        onGuestSuccess={handleGuestSuccess}
        onBack={() => setShowGuestAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4 font-poppins">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="text-4xl mb-2">📚✨</div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-lavender-600 to-blush-500 bg-clip-text text-transparent">
            Today I Learned
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLogin ? 'Welcome back! Sign in to continue your learning journey.' : 'Create an account to start tracking your daily learnings.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  required={!isLogin}
                  disabled={loading}
                  maxLength={20}
                  className="border-2 border-gray-200 focus:border-lavender-400 rounded-xl transition-all duration-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="border-2 border-gray-200 focus:border-lavender-400 rounded-xl transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (at least 6 characters)"
                  required
                  disabled={loading}
                  minLength={6}
                  className="border-2 border-gray-200 focus:border-lavender-400 rounded-xl transition-all duration-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleContinueAsGuest}
              className="w-full border-2 border-mint-300 text-mint-700 hover:bg-mint-50 rounded-xl py-3"
              disabled={loading}
            >
              Continue as Guest 👤
            </Button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-lavender-600 hover:text-lavender-700 font-medium transition-colors"
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Having trouble?</strong> Try refreshing the page or using a different email address.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
