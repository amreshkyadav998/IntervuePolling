import React, { useState } from "react";
import io from "socket.io-client";
import "../src/App.css";
import Teacher from "./components/Teacher";
import Student from "./components/Student";

// Use the correct server port (must match your backend)
// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://intervuepolling.onrender.com/");

const App = () => {
  const [isTeacher, setIsTeacher] = useState(null);

  const handleRoleSelection = (role) => {
    setIsTeacher(role === "teacher");
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-white p-4">
      {isTeacher === null ? (
        <div className="flex flex-col justify-center items-center w-full max-w-xl mx-auto p-8">
          <div className="flex justify-center mb-2">
            <div className="inline-flex bg-purple-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
              Intervue Poll
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome to the Live Polling System</h1>
          <p className="text-center mb-6 text-gray-600 text-sm">
            Please select the role that best describes you to begin using the live polling system
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
            <div 
              onClick={() => handleRoleSelection("student")}
              className={`cursor-pointer p-4 border border-gray-300 rounded-lg hover:border-purple-500 transition-colors`}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-1">I'm a Student</h3>
              <p className="text-sm text-gray-500">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry
              </p>
            </div>
            
            <div 
              onClick={() => handleRoleSelection("teacher")}
              className={`cursor-pointer p-4 border border-gray-300 rounded-lg hover:border-purple-500 transition-colors`}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-1">I'm a Teacher</h3>
              <p className="text-sm text-gray-500">
                Submit answers and view live poll results in real-time
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleRoleSelection("student")} // Default to student if they just click continue
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-8 rounded-full w-48 transition-colors"
          >
            Continue
          </button>
        </div>
      ) : isTeacher ? (
        <Teacher socket={socket} />
      ) : (
        <Student socket={socket} />
      )}
    </div>
  );
};

export default App;