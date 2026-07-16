import { useState } from 'react';
import axios from 'axios';

// Props receive kar rahe hain taaki login ke baad App ko bata sakein
interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void; 
}

function Login({ onLoginSuccess, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Backend ke login API ko call karna
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Token ko browser ki localStorage mein save karna
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId); 
      
      // App ko batana ki login ho gaya
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
       <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login to PrepAI</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
          >
            Login
          </button>
        </form>
         <p className="text-gray-400 text-center mt-4">
          Don't have an account? 
          <button onClick={onSwitchToSignup} className="text-blue-400 ml-1 hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
}

export default Login;