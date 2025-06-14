
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import GuestAuthForm from './GuestAuth/GuestAuthForm';
import GuestInfoSection from './GuestAuth/GuestInfoSection';
import { User as UserType } from '../types';

interface GuestAuthProps {
  onGuestSuccess: (user: UserType) => void;
  onBack: () => void;
}

const GuestAuth: React.FC<GuestAuthProps> = ({ onGuestSuccess, onBack }) => {
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
          <GuestAuthForm onGuestSuccess={onGuestSuccess} />
          
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
            >
              Back to Sign In
            </Button>
          </div>

          <GuestInfoSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestAuth;
