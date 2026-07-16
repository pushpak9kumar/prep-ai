import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  // 'login' | 'signup' | 'dashboard'
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'dashboard'>('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentPage('dashboard');
    }
  }, []);

  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onLoginSuccess={() => setCurrentPage('dashboard')} 
          onSwitchToSignup={() => setCurrentPage('signup')}
        />
      )}
      
      {currentPage === 'signup' && (
        <Signup 
          onSignupSuccess={() => setCurrentPage('login')} 
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setCurrentPage('login');
        }} />
      )}
    </>
  );
}

export default App;