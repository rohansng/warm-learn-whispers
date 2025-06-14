
import React from 'react';
import { useAuthState } from '../hooks/useAuthState';
import AppLayout from '../components/Index/AppLayout';

const Index = () => {
  const {
    user,
    guestUser,
    loading,
    handleAuthSuccess,
    handleGuestSuccess,
    handleLogout
  } = useAuthState();

  return (
    <AppLayout
      user={user}
      guestUser={guestUser}
      loading={loading}
      onAuthSuccess={handleAuthSuccess}
      onGuestSuccess={handleGuestSuccess}
      onLogout={handleLogout}
    />
  );
};

export default Index;
