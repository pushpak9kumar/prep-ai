function App() {
  return (
    // 1. Main container
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      
      {/* 2. Heading */}
      <h1 className="text-5xl font-bold text-blue-400 mb-4">
        PrepAI 🚀
      </h1>
      
      {/* 3. Subheading */}
      <p className="text-xl text-gray-300 text-center max-w-md">
        Your AI-Powered Mock Interview Platform. 
        Get ready to crack your dream job!
      </p>

      {/* 4. Button */}
      <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors duration-200">
        Start Interview
      </button>
    </div>
  )
}

export default App