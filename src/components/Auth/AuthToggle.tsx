
import React from 'react';

interface AuthToggleProps {
  isLogin: boolean;
  loading: boolean;
  onToggle: () => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, loading, onToggle }) => {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm text-lavender-600 hover:text-lavender-700 font-medium transition-colors"
        disabled={loading}
      >
        {isLogin 
          ? "Don't have an account? Sign up" 
          : 'Already have an account? Sign in'
        }
      </button>
    </div>
  );
};

export default AuthToggle;
