
import React, { useState, useEffect } from 'react';
import { TILEntry, User } from '../types';
import { getEntriesByUsername, getUser, saveUser, hasEntryForToday, getRandomPastEntry } from '../utils/localStorage';
import Header from './Header';
import AddEntryCard from './AddEntryCard';
import TimelineView from './TimelineView';
import RandomMemoryCard from './RandomMemoryCard';
import Footer from './Footer';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [entries, setEntries] = useState<TILEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [randomMemory, setRandomMemory] = useState<TILEntry | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = () => {
    const userEntries = getEntriesByUsername(username);
    setEntries(userEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    let userData = getUser(username);
    if (!userData) {
      userData = {
        username,
        totalEntries: userEntries.length,
        lastVisit: new Date()
      };
      saveUser(userData);
    } else {
      userData.lastVisit = new Date();
      userData.totalEntries = userEntries.length;
      saveUser(userData);
    }
    setUser(userData);

    // Get random past entry for memory card
    const memory = getRandomPastEntry(username);
    setRandomMemory(memory);

    // Show add entry card if no entry for today
    setShowAddEntry(!hasEntryForToday(username));
  };

  const handleEntryAdded = () => {
    loadUserData();
  };

  return (
    <div className="min-h-screen bg-gradient-warm pulse-bg font-poppins relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-crimson-500 to-cherry-500 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-gradient-to-l from-scarlet-500 to-crimson-600 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
      </div>

      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-10">
          {/* Welcome hero section */}
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-crimson-300 to-cherry-400 bg-clip-text text-transparent mb-4 animate-bounce-gentle">
                Welcome back, {username}! 🔥
              </h1>
              <div className="w-32 h-1 bg-gradient-button mx-auto rounded-full glow-red"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {entries.length === 0 
                ? "Ready to ignite your learning journey?" 
                : `You've captured ${entries.length} amazing learning moment${entries.length === 1 ? '' : 's'}! Keep the flame burning! 🚀`
              }
            </p>
          </div>

          {/* Random memory card */}
          {randomMemory && (
            <div className="animate-fade-in-up hover-scale">
              <RandomMemoryCard entry={randomMemory} />
            </div>
          )}

          {/* Add entry card */}
          {showAddEntry && (
            <div className="animate-scale-in hover-scale">
              <AddEntryCard username={username} onEntryAdded={handleEntryAdded} />
            </div>
          )}

          {/* Timeline view */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <TimelineView entries={entries} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
