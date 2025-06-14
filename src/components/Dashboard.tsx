
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
    <div className="min-h-screen bg-gradient-warm font-poppins">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Welcome back message */}
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {username}! 👋
            </h1>
            <p className="text-gray-600">
              {entries.length === 0 
                ? "Ready to start your learning journey?" 
                : `You've captured ${entries.length} amazing learning moment${entries.length === 1 ? '' : 's'}!`
              }
            </p>
          </div>

          {/* Random memory card */}
          {randomMemory && (
            <div className="animate-fade-in-up">
              <RandomMemoryCard entry={randomMemory} />
            </div>
          )}

          {/* Add entry card */}
          {showAddEntry && (
            <div className="animate-scale-in">
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
