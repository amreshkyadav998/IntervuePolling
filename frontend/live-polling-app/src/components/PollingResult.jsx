import React, { useState, useEffect } from "react";

const PollingResult = ({ socket }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  
  useEffect(() => {
    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
      
      if (question && question.optionsFrequency) {
        const total = Object.values(question.optionsFrequency).reduce(
          (sum, count) => sum + count, 0
        );
        setTotalVotes(total);
      }
    };
    
    const handlePollingResults = (question) => {
      setCurrentQuestion(question);
      
      if (question && question.optionsFrequency) {
        const total = Object.values(question.optionsFrequency).reduce(
          (sum, count) => sum + count, 0
        );
        setTotalVotes(total);
      }
    };
    
    socket.on("new-question", handleNewQuestion);
    socket.on("polling-results", handlePollingResults);
    
    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("polling-results", handlePollingResults);
    };
  }, [socket]);

  const handleNewQuestion = () => {
    socket.emit("request-new-question");
  };

  const handleViewHistory = () => {
    socket.emit("request-poll-history");
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      {/* View Poll History Button */}
      <div className="flex justify-end mb-6">
        <button 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full flex items-center"
          onClick={handleViewHistory}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          View Poll history
        </button>
      </div>

      {/* Question Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Question</h2>
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          {currentQuestion && currentQuestion.question && (
            <div className="p-3 h-[50px] font-medium bg-gray-800 text-white">
              {currentQuestion.question}
            </div>
          )}
          
          <div className="p-4">
            {currentQuestion && currentQuestion.optionsFrequency ? (
              Object.entries(currentQuestion.optionsFrequency).map(([option], index) => {
                const percentage = parseInt(currentQuestion.results[option]) || 0;
                const isCorrect = currentQuestion.correctAnswer === option;
                
                return (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="relative h-10 bg-gray-100 rounded-md overflow-hidden flex items-center">
                      {/* Percentage-based fill */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      
                      {/* Circle with number */}
                      <div className="z-10 ml-2 flex items-center">
                        <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-purple-500 font-medium">
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Option text */}
                      <span className="z-10 ml-2 font-medium flex-grow">
                        {option}
                      </span>
                      
                      {/* Percentage */}
                      <span className="z-10 mr-4">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-400">
                Waiting for votes...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ask New Question Button */}
      {/* <div className="flex justify-center">
        <button 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full flex items-center"
          onClick={handleNewQuestion}
        >
          <span className="mr-2">+</span> Ask a new question
        </button>
      </div> */}
    </div>
  );
};

export default PollingResult;