import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getProfileByUsername, createProfile, getNotesByUserId } from '@/utils/supabaseStorage';
import { User as UserType } from '../types';
import { User } from 'lucide-react';

interface GuestAuthProps {
  onGuestSuccess: (user: UserType) => void;
  onBack: () => void;
}

const GuestAuth: React.FC<GuestAuthProps> = ({ onGuestSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGuestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting guest auth for username:', username);
    
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Username Required",
        description: "Please enter a username to continue.",
      });
      return;
    }

    if (username.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Username Too Short",
        description: "Username must be at least 3 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      console.log('Checking for existing profile with username:', trimmedUsername);
      
      // Check if username exists
      let profile = await getProfileByUsername(trimmedUsername);
      console.log('Profile lookup result:', profile);
      
      if (!profile) {
        // Create new guest profile with a unique guest ID
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Creating new guest profile with ID:', guestId);
        
        profile = await createProfile(guestId, trimmedUsername, '');
        
        if (!profile) {
          throw new Error('Failed to create guest profile');
        }

        console.log('New guest profile created:', profile);
        toast({
          title: "Welcome!",
          description: `Guest account created for ${trimmedUsername}. Your data will be saved and accessible from any device with this username.`,
        });
      } else {
        // Existing username found - load their data
        console.log('Found existing profile:', profile);
        const notes = await getNotesByUserId(profile.id);
        toast({
          title: "Welcome back!",
          description: `Found ${notes.length} saved learning${notes.length !== 1 ? 's' : ''} for ${trimmedUsername}.`,
        });
      }

      // Create user object for the app
      const user: UserType = {
        id: profile.id,
        username: profile.username,
        email: profile.email || '',
        totalEntries: profile.total_entries || 0,
        lastVisit: profile.last_visit || new Date().toISOString()
      };

      console.log('Calling onGuestSuccess with user:', user);
      onGuestSuccess(user);
      
    } catch (error) {
      console.error('Guest auth error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to authenticate as guest. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4 font-poppins">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-mint-500 to-lavender-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-lavender-600 to-blush-500 bg-clip-text text-transparent">
            Continue as Guest
          </CardTitle>
          <CardDescription className="text-gray-600">
            Choose a unique username to save your learnings. Your data will be accessible from any device using this username.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleGuestAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="guest-username" className="block text-sm font-medium text-gray-700">
                Choose Username
              </label>
              <Input
                id="guest-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a unique username..."
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
                className="border-2 border-gray-200 focus:border-lavender-400 rounded-xl transition-all duration-300"
              />
              <p className="text-xs text-gray-500">
                Use the same username on any device to access your saved learnings
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-mint-500 to-lavender-500 hover:from-mint-600 hover:to-lavender-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
              disabled={loading || !username.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Checking username...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Continue as Guest
                </div>
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
              onClick={onBack}
              className="w-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
              disabled={loading}
            >
              Back to Sign In
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Guest Benefits:</strong> No email required, instant access, data synced across devices with your username.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestAuth;
