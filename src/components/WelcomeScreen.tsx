
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Footer from './Footer';

interface WelcomeScreenProps {
  onUsernameSubmit: (username: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUsernameSubmit }) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onUsernameSubmit(username.trim());
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated flex flex-col font-poppins">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-scale-in">
          <div className="text-center mb-8">
            <div className="pulse-red inline-block p-6 rounded-full bg-gradient-primary mb-4">
              <h1 className="text-6xl font-orbitron font-bold text-white animate-bounce-gentle">
                📚✨
              </h1>
            </div>
            <h2 className="text-4xl font-orbitron font-bold gradient-text mb-4">
              Today I Learned
            </h2>
            <p className="text-gray-300 text-lg">
              Your daily learning journey starts here
            </p>
          </div>

          <Card className="glass-card p-8 rounded-2xl animate-fade-in-up glow-red">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter your unique username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a memorable username..."
                  className="glass border-red-crimson/50 focus:border-red-cherry text-white placeholder-gray-400 text-lg py-3 px-4 rounded-xl transition-all duration-300 glow-red-hover"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="w-full bg-gradient-primary hover:glow-red-hover text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Loading your journey...
                  </div>
                ) : (
                  "Start Learning Journey 🚀"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>✨ No signup required - just remember your username!</p>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Track daily learnings • Add meaningful tags • Build your knowledge timeline
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WelcomeScreen;
