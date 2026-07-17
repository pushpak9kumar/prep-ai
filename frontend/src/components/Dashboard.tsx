import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardProps {
  onLogout: () => void;
}

interface Question {
  id: string;
  questionText: string;
}

interface Interview {
  id: string;
  jobDescription: string;
  createdAt: string;
  questions: Question[];
}

function Dashboard({ onLogout }: DashboardProps) {
  // Tabs: 'generate' or 'history'
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  
  // Generate Tab States
  const [jobDescription, setJobDescription] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // History Tab States
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Grading States
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<string, boolean>>({});

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Jab Dashboard load ho, history fetch karo
  useEffect(() => {
    if (userId && activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ai/history/${userId}`);
      setPastInterviews(res.data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCurrentQuestions([]);
    setAnswers({});
    setGrades({});

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        { jobDescription, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentQuestions(response.data.questions);
    } catch (err) {
      alert('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (question: string) => {
    const answer = answers[question];
    if (!answer) return alert('Please write an answer first!');

    setGradingLoading(prev => ({ ...prev, [question]: true }));

    try {
      const res = await axios.post('http://localhost:5000/api/ai/grade-answer', {
        question,
        answer,
        jobDescription
      });
      setGrades(prev => ({ ...prev, [question]: res.data }));
    } catch (err) {
      alert('Failed to grade answer');
    } finally {
      setGradingLoading(prev => ({ ...prev, [question]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          PrepAI Pro
        </h1>
        <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm transition-all">Logout</button>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto flex gap-4 mb-8 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'generate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          ✨ New Interview
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
           Past Interviews
        </button>
      </div>

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Job Description</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste JD here..."
                className="w-full h-48 p-4 rounded-xl bg-black/30 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
              />
              <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02]">
                {loading ? 'AI is thinking...' : 'Generate Questions'}
              </button>
            </form>
          </div>

          {/* Right: Questions & Grading */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl min-h-[400px]">
            <h2 className="text-xl font-bold mb-6 text-green-400">Questions & AI Grading</h2>
            <ul className="space-y-6">
              {currentQuestions.map((q, index) => (
                <li key={index} className="bg-black/20 border-l-4 border-indigo-500 rounded-r-lg p-4">
                  <p className="font-semibold mb-3"><span className="text-indigo-400 mr-2">Q{index + 1}:</span> {q}</p>
                  
                  {/* Answer Input */}
                  <textarea
                    value={answers[q] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                    placeholder="Type your answer here..."
                    className="w-full h-24 p-3 rounded-lg bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-2"
                  />
                  
                  <button 
                    onClick={() => handleGrade(q)}
                    disabled={gradingLoading[q]}
                    className="bg-purple-600 hover:bg-purple-700 text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    {gradingLoading[q] ? 'Grading...' : '🤖 Grade my Answer'}
                  </button>

                  {/* Grading Result */}
                  {grades[q] && (
                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400 font-bold text-lg">Score: {grades[q].score}/10</span>
                      </div>
                      <p className="text-sm text-slate-300">{grades[q].feedback}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="max-w-5xl mx-auto">
          {pastInterviews.length === 0 ? (
            <p className="text-center text-slate-500 mt-10">No past interviews found.</p>
          ) : (
            <div className="grid gap-4">
              {pastInterviews.map((interview) => (
                <div 
                  key={interview.id} 
                  onClick={() => setSelectedInterview(interview)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-xl cursor-pointer transition-all"
                >
                  <h3 className="font-bold text-lg truncate">{interview.jobDescription.substring(0, 60)}...</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(interview.createdAt).toLocaleDateString()} • {interview.questions.length} Questions
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Interview Detail View */}
          {selectedInterview && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedInterview(null)}>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Interview Details</h2>
                <p className="text-slate-400 mb-6 text-sm">{selectedInterview.jobDescription}</p>
                <ul className="space-y-4">
                  {selectedInterview.questions.map((q, i) => (
                    <li key={q.id} className="bg-white/5 p-4 rounded-lg border-l-4 border-purple-500">
                      <span className="text-purple-400 font-bold mr-2">Q{i+1}:</span> {q.questionText}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setSelectedInterview(null)} className="mt-6 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold">Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;