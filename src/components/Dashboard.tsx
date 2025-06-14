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

    const memory = getRandomPastEntry(username);
    setRandomMemory(memory);

    setShowAddEntry(!hasEntryForToday(username));
  };

  const handleEntryAdded = () => {
    loadUserData();
  };

  return (
    <div className="min-h-screen bg-gradient-animated font-poppins">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl pb-32">
        <div className="space-y-8">
          {/* Hero section with animated pulse */}
          <div className="text-center animate-fade-in">
            <div className="pulse-cherry inline-block p-4 rounded-full bg-gradient-primary mb-4">
              <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
                Welcome back, {username}! 🚀
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {entries.length === 0 
                ? "Ready to start your learning journey?" 
                : `You've captured ${entries.length} amazing learning moment${entries.length === 1 ? '' : 's'}!`
              }
            </p>
          </div>

          {/* Random memory card */}
          {randomMemory && (
            <div className="animate-scale-in">
              <RandomMemoryCard entry={randomMemory} />
            </div>
          )}

          {/* Add entry card */}
          {showAddEntry && (
            <div className="animate-slide-in-left">
              <AddEntryCard username={username} onEntryAdded={handleEntryAdded} />
            </div>
          )}

          {/* Timeline view */}
          <div className="animate-fade-in-up">
            <TimelineView entries={entries} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
