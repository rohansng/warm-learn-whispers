
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 font-poppins">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-red-600 animate-bounce-gentle">
            📚✨
          </h1>
          <h2 className="text-3xl font-semibold text-white mb-2">
            Today I Learned
          </h2>
          <p className="text-gray-300 text-lg">
            Your daily learning journey starts here
          </p>
        </div>

        <Card className="p-8 bg-gradient-card backdrop-blur-sm shadow-xl border border-red-600/20 animate-scale-in hover:shadow-red-600/20 hover:shadow-2xl transition-all duration-300">
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
                className="text-lg py-3 px-4 border-2 border-red-600/30 focus:border-red-600 rounded-xl transition-all duration-300 bg-black/50 text-white placeholder:text-gray-500"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <Button
              type="submit"
              disabled={!username.trim() || isSubmitting}
              className="w-full bg-gradient-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-600/40 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default WelcomeScreen;
