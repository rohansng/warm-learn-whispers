
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import GuestAuth from '../components/GuestAuth';
import AuthHeader from '../components/Auth/AuthHeader';
import AuthForm from '../components/Auth/AuthForm';
import AuthToggle from '../components/Auth/AuthToggle';
import GuestAuthButton from '../components/Auth/GuestAuthButton';
import HelpInfo from '../components/Auth/HelpInfo';
import { User as AppUser } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onGuestSuccess?: (user: AppUser) => void;
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
        console.log('Auth: Found existing session, calling onAuthSuccess');
        onAuthSuccess(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Auth: User signed in, calling onAuthSuccess');
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
    console.log('Auth: Continue as guest clicked');
    setShowGuestAuth(true);
  };

  const handleGuestSuccess = (user: AppUser) => {
    console.log('Auth: Guest success received, user:', user);
    if (onGuestSuccess) {
      console.log('Auth: Calling onGuestSuccess');
      onGuestSuccess(user);
    } else {
      console.error('Auth: onGuestSuccess callback not provided!');
    }
  };

  const handleBackFromGuest = () => {
    console.log('Auth: Back from guest auth');
    setShowGuestAuth(false);
  };

  if (showGuestAuth) {
    console.log('Auth: Rendering GuestAuth component');
    return (
      <GuestAuth
        onGuestSuccess={handleGuestSuccess}
        onBack={handleBackFromGuest}
      />
    );
  }

  console.log('Auth: Rendering main auth form');

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4 font-poppins">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <AuthHeader isLogin={isLogin} />
        <CardContent className="space-y-6">
          <AuthForm
            isLogin={isLogin}
            email={email}
            password={password}
            username={username}
            showPassword={showPassword}
            loading={loading}
            setEmail={setEmail}
            setPassword={setPassword}
            setUsername={setUsername}
            setShowPassword={setShowPassword}
            onSubmit={handleAuth}
          />
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <GuestAuthButton
              loading={loading}
              onClick={handleContinueAsGuest}
            />
          </div>
          
          <AuthToggle
            isLogin={isLogin}
            loading={loading}
            onToggle={() => setIsLogin(!isLogin)}
          />

          <HelpInfo />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
