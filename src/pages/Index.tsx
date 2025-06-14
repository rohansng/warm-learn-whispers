
import React, { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import Dashboard from '../components/Dashboard';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('til_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const handleUsernameSubmit = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('til_current_user', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('til_current_user');
  };

  if (!currentUser) {
    return <WelcomeScreen onUsernameSubmit={handleUsernameSubmit} />;
  }

  return <Dashboard />;
};

export default Index;
