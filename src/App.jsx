import React, { useEffect, useState } from 'react';
import LoginView from './components/ui/LoginView';
import RestaurantVendorUI from './components/ui/RestaurantVendorUI';

function App() {
  const [user, setUser] = useState(null);

  // Restore session safely
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const theme = {
    bgMain: 'bg-slate-950',
    bgCard: 'bg-slate-900',
    textMain: 'text-white',
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} theme={theme} />;
  }

  return <RestaurantVendorUI user={user} onLogout={handleLogout} />;
}

export default App;