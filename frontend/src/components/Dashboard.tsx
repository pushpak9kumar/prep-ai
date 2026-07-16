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
      
      // Backend ke AI API ko call karna (Header mein Token bhejna zaroori hai)
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        { jobDescription },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setQuestions(response.data.questions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400">PrepAI Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* JD Input Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Enter Job Description</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-40 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
            >
              {loading ? 'AI is thinking...' : 'Generate Questions'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Questions Display Section */}
        {questions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">AI Generated Questions</h2>
            <ul className="space-y-3">
              {questions.map((q, index) => (
                <li key={index} className="bg-gray-700 p-4 rounded border-l-4 border-blue-500">
                  <span className="font-bold text-blue-300 mr-2">Q{index + 1}:</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;