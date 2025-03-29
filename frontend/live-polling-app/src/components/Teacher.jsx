import React, { useState, useEffect } from "react";
import PollingResult from "./PollingResult";
import { Button } from "react-bootstrap";

const Teacher = ({ socket }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [questionPublished, setQuestionPublished] = useState(false);
  const [timer, setTimer] = useState(60);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [error, setError] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  useEffect(() => {
    // Listen for student connections
    socket.on("student-connected", (students) => {
      setConnectedStudents(students);
    });

    socket.on("student-disconnected", (students) => {
      setConnectedStudents(students);
    });

    // Listen for student vote updates
    socket.on("student-voted", (updatedStudents) => {
      setConnectedStudents(updatedStudents);
    });

    return () => {
      socket.off("student-connected");
      socket.off("student-disconnected");
      socket.off("student-voted");
    };
  }, [socket]);

  const validateQuestion = () => {
    if (!question.trim()) {
      setError("Question cannot be empty");
      return false;
    }

    const validOptions = options.filter((option) => option.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least two options are required");
      return false;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(validOptions);
    if (uniqueOptions.size !== validOptions.length) {
      setError("Options must be unique");
      return false;
    }

    setError("");
    return true;
  };

  const askQuestion = () => {
    if (!validateQuestion()) return;

    // Find the correct answer (if any)
    const correctAnswer = Object.keys(correctAnswers).find(
      (option) => correctAnswers[option]
    );

    // Generate a unique question ID
    const questionId = Date.now().toString();
    setCurrentQuestionId(questionId);

    const questionData = {
      id: questionId,
      question,
      options: options.filter((option) => option.trim() !== ""),
      timer,
      correctAnswer,
    };

    socket.emit("teacher-ask-question", questionData);
    setQuestionPublished(true);
  };

  const addOption = () => {
    if (options.length < 6) {
      // Limit to 6 options
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const updatedOptions = [...options];
      updatedOptions.splice(index, 1);
      setOptions(updatedOptions);

      // Update correct answers
      const newCorrectAnswers = { ...correctAnswers };
      delete newCorrectAnswers[options[index]];
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const updateOption = (index, value) => {
    const oldValue = options[index];
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    // Update correct answers mapping
    if (correctAnswers[oldValue]) {
      const newCorrectAnswers = { ...correctAnswers };
      delete newCorrectAnswers[oldValue];
      newCorrectAnswers[value] = true;
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const toggleCorrectAnswer = (option, isCorrect) => {
    // Create a new object with all options set to false
    const newCorrectAnswers = {};

    // Set only the selected option to the new state
    if (isCorrect) {
      newCorrectAnswers[option] = true;
    }

    setCorrectAnswers(newCorrectAnswers);
  };

  const askAnotherQuestion = () => {
    setQuestionPublished(false);
    setQuestion("");
    setOptions(["", ""]);
    setCorrectAnswers({});
    setTimer(60);
    setError("");
    setCurrentQuestionId(null);
  };

  return (
    <div className="w-full md:w-[80%] lg:w-[60%] h-auto min-h-[80vh] p-4">
      <h1 className="text-3xl font-bold mb-5 text-gray-800">
        Teacher Interface
      </h1>

      {!questionPublished ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div className="inline-flex bg-purple-500 text-white text-xs font-semibold py-1 px-2 rounded-full">
                <svg
                  width="16"
                  height="15"
                  viewBox="0 0 16 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.8016 8.76363C12.8028 8.96965 12.7402 9.17098 12.6223 9.33992C12.5044 9.50887 12.337 9.63711 12.1432 9.707L8.88111 10.907L7.68107 14.1671C7.6101 14.3604 7.48153 14.5272 7.31274 14.645C7.14394 14.7628 6.94305 14.826 6.7372 14.826C6.53135 14.826 6.33045 14.7628 6.16166 14.645C5.99286 14.5272 5.8643 14.3604 5.79333 14.1671L4.59076 10.9111L1.33017 9.71104C1.13711 9.63997 0.970488 9.5114 0.852794 9.34266C0.735101 9.17392 0.671997 8.97315 0.671997 8.76742C0.671997 8.56169 0.735101 8.36092 0.852794 8.19218C0.970488 8.02345 1.13711 7.89487 1.33017 7.82381L4.59227 6.62376L5.79232 3.36418C5.86339 3.17112 5.99196 3.0045 6.1607 2.88681C6.32943 2.76911 6.53021 2.70601 6.73593 2.70601C6.94166 2.70601 7.14244 2.76911 7.31117 2.88681C7.47991 3.0045 7.60848 3.17112 7.67955 3.36418L8.8796 6.62629L12.1392 7.82633C12.3328 7.8952 12.5003 8.02223 12.6189 8.19003C12.7375 8.35782 12.8013 8.55817 12.8016 8.76363ZM9.26462 2.70024H10.2752V3.71081C10.2752 3.84482 10.3284 3.97334 10.4232 4.06809C10.5179 4.16285 10.6465 4.21609 10.7805 4.21609C10.9145 4.21609 11.043 4.16285 11.1378 4.06809C11.2325 3.97334 11.2858 3.84482 11.2858 3.71081V2.70024H12.2963C12.4303 2.70024 12.5588 2.64701 12.6536 2.55225C12.7484 2.45749 12.8016 2.32897 12.8016 2.19496C12.8016 2.06095 12.7484 1.93243 12.6536 1.83767C12.5588 1.74291 12.4303 1.68968 12.2963 1.68968H11.2858V0.679111C11.2858 0.545101 11.2325 0.416581 11.1378 0.321822C11.043 0.227063 10.9145 0.173828 10.7805 0.173828C10.6465 0.173828 10.5179 0.227063 10.4232 0.321822C10.3284 0.416581 10.2752 0.545101 10.2752 0.679111V1.68968H9.26462C9.13061 1.68968 9.00209 1.74291 8.90733 1.83767C8.81257 1.93243 8.75934 2.06095 8.75934 2.19496C8.75934 2.32897 8.81257 2.45749 8.90733 2.55225C9.00209 2.64701 9.13061 2.70024 9.26462 2.70024ZM14.8227 4.72137H14.3174V4.21609C14.3174 4.08208 14.2642 3.95356 14.1695 3.8588C14.0747 3.76404 13.9462 3.71081 13.8122 3.71081C13.6782 3.71081 13.5496 3.76404 13.4549 3.8588C13.3601 3.95356 13.3069 4.08208 13.3069 4.21609V4.72137H12.8016C12.6676 4.72137 12.5391 4.77461 12.4443 4.86937C12.3496 4.96412 12.2963 5.09264 12.2963 5.22665C12.2963 5.36066 12.3496 5.48918 12.4443 5.58394C12.5391 5.6787 12.6676 5.73194 12.8016 5.73194H13.3069V6.23722C13.3069 6.37123 13.3601 6.49975 13.4549 6.59451C13.5496 6.68927 13.6782 6.7425 13.8122 6.7425C13.9462 6.7425 14.0747 6.68927 14.1695 6.59451C14.2642 6.49975 14.3174 6.37123 14.3174 6.23722V5.73194H14.8227C14.9567 5.73194 15.0853 5.6787 15.18 5.58394C15.2748 5.48918 15.328 5.36066 15.328 5.22665C15.328 5.09264 15.2748 4.96412 15.18 4.86937C15.0853 4.77461 14.9567 4.72137 14.8227 4.72137Z"
                    fill="white"
                  />
                </svg>
                <span className="ml-1">INTERVUE POLL</span>
              </div>
              
              <div className="relative">
                <select
                  className="border border-gray-300 rounded-md bg-white p-1 pr-8 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none"
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                >
                  <option value="30">30 seconds</option>
                  <option value="45">45 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-indigo-500">▼</span>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Let's Get Started
            </h2>
            <p className="text-gray-600 text-sm">
              You'll have the ability to create and manage polls, ask questions,
              and monitor your students' responses in real-time.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter your question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              className="w-full h-24 border border-gray-300 bg-gray-100 rounded-md p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {question.length}/100
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div className="text-gray-700 text-sm font-medium">Edit Options</div>
            <div className="text-gray-700 text-sm font-medium">Is It Correct?</div>
          </div>

          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-3">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold mr-2">
                {index + 1}
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-grow h-10 p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="ml-4 flex items-center">
                <label className="inline-flex items-center cursor-pointer mr-3">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-purple-600"
                    checked={correctAnswers[option] === true}
                    onChange={() => toggleCorrectAnswer(option, true)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-purple-600"
                    checked={correctAnswers[option] !== true}
                    onChange={() => toggleCorrectAnswer(option, false)}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          ))}

          {options.length < 6 && (
            <button
              onClick={addOption}
              className="text-purple-600 border border-purple-600 rounded-md px-3 py-2 text-sm font-medium mb-6 hover:bg-purple-50"
            >
              + Add More option
            </button>
          )}

          <div className="flex justify-end">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md w-full sm:w-auto"
              variant="primary"
              onClick={askQuestion}
            >
              Ask Question
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Connected Students: {connectedStudents.length}
            </h2>
            <div className="flex flex-wrap gap-2">
              {connectedStudents.map((student, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm text-white ${
                    student.voted ? "bg-green-600" : "bg-gray-500"
                  }`}
                >
                  {student.name} {student.voted ? "✓" : ""}
                </div>
              ))}
            </div>
          </div>

          <PollingResult socket={socket} questionId={currentQuestionId} />

          <div className="flex justify-center mt-4">
            <Button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full flex items-center"
              variant="primary"
              onClick={askAnotherQuestion}
            >
              + Ask a new question
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Teacher;