
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials.",
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              variant: "destructive",
              title: "Email Not Confirmed",
              description: "Please check your email and click the confirmation link before logging in.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: error.message,
            });
          }
        } else if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You've been successfully logged in.",
          });
          onAuthSuccess(data.user);
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              variant: "destructive",
              title: "Account Already Exists",
              description: "An account with this email already exists. Please try logging in instead.",
            });
            setIsLogin(true);
          } else if (error.message.includes('Password should be at least 6 characters')) {
            toast({
              variant: "destructive",
              title: "Password Too Short",
              description: "Password should be at least 6 characters long.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup Failed",
              description: error.message,
            });
          }
        } else if (data.user) {
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
              title: "Account Created!",
              description: "Please check your email and click the confirmation link to complete your registration.",
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4 font-poppins">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Today I Learned
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back! Sign in to continue your learning journey.' : 'Create an account to start tracking your daily learnings.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
                  minLength={3}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password (at least 6 characters)"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600"
              disabled={loading || (!isLogin && username.length < 3)}
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
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-lavender-600 hover:text-lavender-700 font-medium"
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Helpful tip for testing */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>For testing:</strong> If email confirmation is required, check your email inbox for the confirmation link.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
