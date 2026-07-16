import { useState } from 'react';
import axios from 'axios';

interface SignupProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

function Signup({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name, email, password,
      });
      // Register successful, ab login page par bhej do
      alert('Signup successful! Please login.');
      onSwitchToLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Email might already exist.');
    }
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
       <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up for PrepAI</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors"
          >
            Sign Up
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4">
          Already have an account? 
          <button onClick={onSwitchToLogin} className="text-blue-400 ml-1 hover:underline">Login</button>
        </p>
      </div>
    </div>
  );
}

export default Signup;