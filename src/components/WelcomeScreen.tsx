
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
    <div className="min-h-screen bg-gradient-hero pulse-bg flex items-center justify-center p-4 font-poppins relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-r from-crimson-500 to-cherry-500 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-l from-scarlet-500 to-crimson-600 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-cherry-400 rounded-full blur-2xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-lg w-full animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-crimson-400 via-cherry-500 to-scarlet-400 bg-clip-text text-transparent animate-bounce-gentle">
            📚✨
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Today I <span className="bg-gradient-to-r from-crimson-400 to-cherry-500 bg-clip-text text-transparent">Learned</span>
          </h2>
          <p className="text-gray-300 text-xl leading-relaxed">
            Your <span className="text-cherry-400 font-semibold">daily learning journey</span> starts here
          </p>
        </div>

        <Card className="glass-card p-8 shadow-2xl border-0 animate-scale-in glow-red">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-3">
                Enter your unique username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a memorable username..."
                className="text-lg py-4 px-6 bg-dark-800/50 border-2 border-crimson-500/30 focus:border-cherry-500 rounded-xl transition-all duration-300 text-white placeholder-gray-400 hover-glow"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <Button
              type="submit"
              disabled={!username.trim() || isSubmitting}
              className="w-full bg-gradient-button hover:glow-red-intense text-white font-bold py-4 px-8 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Igniting your journey...
                </div>
              ) : (
                "Start Learning Journey 🚀"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>✨ No signup required - just remember your username!</p>
          </div>
        </Card>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-lg">
            Track daily learnings • Add meaningful tags • Build your knowledge timeline
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
