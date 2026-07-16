import { useState } from 'react';
import axios from 'axios';

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuestions([]);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        { jobDescription, userId },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setQuestions(response.data.questions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-12">
      {/* Premium Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            PrepAI Pro
          </h1>
          <p className="text-slate-400 mt-1">Master your next interview with AI</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left: Input Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Job Description
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here (e.g., React Developer, 3 YOE, Node.js...)"
              className="w-full h-64 p-4 rounded-xl bg-black/30 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI is analyzing...
                </>
              ) : (
                '✨ Generate Interview Questions'
              )}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        </div>

        {/* Right: Questions Display Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl min-h-[400px]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            AI Generated Questions
          </h2>
          
          {questions.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <p>Questions will appear here</p>
            </div>
          )}

          <ul className="space-y-4">
            {questions.map((q, index) => (
              <li key={index} className="bg-black/20 border-l-4 border-indigo-500 rounded-r-lg p-4 hover:bg-black/30 transition-colors duration-200 group">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <p className="text-slate-200 leading-relaxed">{q}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;