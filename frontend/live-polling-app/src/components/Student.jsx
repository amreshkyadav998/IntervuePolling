import React, { useState, useEffect } from "react";
import tower from "../assets/tower-icon.png";
import { getVariant } from "../utils/util";

const Student = ({ socket }) => {
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [connectedStudents, setConnectedStudents] = useState(null);
  const [votingValidation, setVotingValidation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [countdownInterval, setCountdownIntervalId] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem("studentName");

    if (name) {
      setName(name);
      setShowQuestion(true);
      socket.emit("student-set-name", { name });
    }

    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
      setShowQuestion(true);
      setSelectedOption("");
      setVotingValidation(false);
      setShowResults(false);
      setTimeRemaining(question.timer);

      // Clear any existing interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      // Start countdown timer
      const interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      setCountdownIntervalId(interval);

      // Return the cleanup function
      return () => clearInterval(interval);
    };

    const handleStudentVoteValidation = (connectedStudents) => {
      setConnectedStudents(connectedStudents);
    };

    const handleIndividualResults = (results) => {
      setCurrentQuestion(results);
      setShowResults(true);
    };

    const handlePollingResults = (results) => {
      setCurrentQuestion(results);
      setVotingValidation(true);
      setShowResults(true);

      // Clear the countdown timer if it's still running
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownIntervalId(null);
      }
    };

    socket.on("new-question", handleNewQuestion);
    socket.on("student-vote-validation", handleStudentVoteValidation);
    socket.on("individual-polling-results", handleIndividualResults);
    socket.on("polling-results", handlePollingResults);

    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("student-vote-validation", handleStudentVoteValidation);
      socket.off("individual-polling-results", handleIndividualResults);
      socket.off("polling-results", handlePollingResults);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [socket, countdownInterval]);

  const handleSubmit = () => {
    localStorage.setItem("studentName", name);
    socket.emit("student-set-name", { name });
    setShowQuestion(true);
  };

  const handlePoling = () => {
    socket.emit("handle-polling", {
      option: selectedOption,
    });
    setVotingValidation(true);
  };

  useEffect(() => {
    const found = connectedStudents
      ? connectedStudents?.find((data) => data.socketId === socket.id)
      : undefined;
    if (found) {
      setVotingValidation(found.voted);
    }
  }, [connectedStudents, socket.id]);

  // Custom progress bar component to replace Bootstrap ProgressBar
  const ProgressBar = ({ now, label, variant, animated }) => {
    // Convert variant names to tailwind classes
    const getVariantClass = (variant, value) => {
      switch (variant) {
        case 'success':
          return 'bg-green-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'danger':
          return 'bg-red-500';
        default:
          return 'bg-blue-500';
      }
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
        <div
          className={`${getVariantClass(variant)} h-full flex items-center justify-start transition-all ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${now}%` }}
        >
          <div className="px-3 text-left">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center w-full h-[100] p-4 md:p-40">
      {showQuestion && name ? (
        <div className="w-full border border-[#6edff6] shadow-md rounded-lg overflow-hidden">
          <h1 className="text-center text-3xl font-bold p-4">
            Welcome, {name}
          </h1>
          {currentQuestion ? (
            !showResults ? (
              <div className="gap-y-4 gap-x-4 border-t border-[#6edff6] ml-0 md:ml-4 p-4 md:p-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Question: {currentQuestion.question}
                  </h2>
                  <div className="text-lg font-semibold bg-gray-700 p-2 rounded-lg">
                    Time:{" "}
                    <span
                      className={
                        timeRemaining < 10 ? "text-red-500" : "text-green-500"
                      }
                    >
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex hover:bg-gray-300 hover:text-black ${
                      selectedOption === option
                        ? "border-2 border-green-500"
                        : "border border-[#6edff6]"
                    } justify-between my-4 h-12 p-4 cursor-pointer items-center rounded-md`}
                    onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </div>
                ))}
                <button
                  className={`h-10 bg-green-600 text-white w-full md:w-1/5 rounded-lg font-semibold mt-4 ${
                    !selectedOption || votingValidation 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-green-700"
                  }`}
                  onClick={handlePoling}
                  disabled={!selectedOption || votingValidation}
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="mt-6 mb-12 border border-[#6edff6] shadow-md mx-4">
                <h2 className="text-center items-center font-bold text-xl flex justify-center m-3">
                  <img
                    src={tower}
                    alt=""
                    width="20px"
                    height="20px"
                    className="mr-5"
                  />
                  Live Results
                </h2>
                <ul className="gap-y-4 gap-x-4 border-t border-[#6edff6] w-full p-4">
                  {currentQuestion &&
                    Object.entries(currentQuestion.optionsFrequency).map(
                      ([option], index) => (
                        <div className="m-4" key={index}>
                          <ProgressBar
                            now={parseInt(currentQuestion.results[option]) || 0}
                            label={
                              <span className="text-xl text-black font-semibold">
                                {option}{" "}
                                {parseInt(currentQuestion.results[option]) || 0}
                                %
                                {currentQuestion.correctAnswer === option &&
                                  " ✓"}
                              </span>
                            }
                            variant={getVariant(
                              parseInt(currentQuestion.results[option]) || 0
                            )}
                            animated={
                              getVariant(
                                parseInt(currentQuestion.results[option]) || 0
                              ) !== "success"
                            }
                          />
                        </div>
                      )
                    )}
                </ul>
                {!currentQuestion.answered && (
                  <div className="text-center pb-4 text-yellow-300">
                    Waiting for other students to submit their answers...
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="mb-6">
                <div className="bg-[#4D0ACD] flex gap-[7px] text-white text-xs font-medium px-3 py-1 rounded-full">
                  <svg
                    width="16"
                    height="15"
                    viewBox="0 0 16 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.8016 8.76375C12.8028 8.96977 12.7402 9.1711 12.6223 9.34005C12.5044 9.50899 12.337 9.63723 12.1432 9.70712L8.88111 10.9072L7.68107 14.1672C7.6101 14.3605 7.48153 14.5273 7.31274 14.6451C7.14394 14.7629 6.94305 14.8261 6.7372 14.8261C6.53135 14.8261 6.33045 14.7629 6.16166 14.6451C5.99286 14.5273 5.8643 14.3605 5.79333 14.1672L4.59076 10.9112L1.33017 9.71116C1.13711 9.64009 0.970488 9.51152 0.852794 9.34278C0.735101 9.17405 0.671997 8.97327 0.671997 8.76754C0.671997 8.56182 0.735101 8.36104 0.852794 8.1923C0.970488 8.02357 1.13711 7.89499 1.33017 7.82393L4.59227 6.62388L5.79232 3.3643C5.86339 3.17124 5.99196 3.00462 6.1607 2.88693C6.32943 2.76924 6.53021 2.70613 6.73593 2.70613C6.94166 2.70613 7.14244 2.76924 7.31117 2.88693C7.47991 3.00462 7.60848 3.17124 7.67955 3.3643L8.8796 6.62641L12.1392 7.82646C12.3328 7.89533 12.5003 8.02236 12.6189 8.19015C12.7375 8.35794 12.8013 8.55829 12.8016 8.76375ZM9.26462 2.70036H10.2752V3.71093C10.2752 3.84494 10.3284 3.97346 10.4232 4.06822C10.5179 4.16298 10.6465 4.21621 10.7805 4.21621C10.9145 4.21621 11.043 4.16298 11.1378 4.06822C11.2325 3.97346 11.2858 3.84494 11.2858 3.71093V2.70036H12.2963C12.4303 2.70036 12.5588 2.64713 12.6536 2.55237C12.7484 2.45761 12.8016 2.32909 12.8016 2.19508C12.8016 2.06107 12.7484 1.93255 12.6536 1.83779C12.5588 1.74303 12.4303 1.6898 12.2963 1.6898H11.2858V0.679233C11.2858 0.545224 11.2325 0.416703 11.1378 0.321944C11.043 0.227185 10.9145 0.17395 10.7805 0.17395C10.6465 0.17395 10.5179 0.227185 10.4232 0.321944C10.3284 0.416703 10.2752 0.545224 10.2752 0.679233V1.6898H9.26462C9.13061 1.6898 9.00209 1.74303 8.90733 1.83779C8.81257 1.93255 8.75934 2.06107 8.75934 2.19508C8.75934 2.32909 8.81257 2.45761 8.90733 2.55237C9.00209 2.64713 9.13061 2.70036 9.26462 2.70036ZM14.8227 4.72149H14.3174V4.21621C14.3174 4.0822 14.2642 3.95368 14.1695 3.85892C14.0747 3.76416 13.9462 3.71093 13.8122 3.71093C13.6782 3.71093 13.5496 3.76416 13.4549 3.85892C13.3601 3.95368 13.3069 4.0822 13.3069 4.21621V4.72149H12.8016C12.6676 4.72149 12.5391 4.77473 12.4443 4.86949C12.3496 4.96425 12.2963 5.09277 12.2963 5.22678C12.2963 5.36079 12.3496 5.48931 12.4443 5.58406C12.5391 5.67882 12.6676 5.73206 12.8016 5.73206H13.3069V6.23734C13.3069 6.37135 13.3601 6.49987 13.4549 6.59463C13.5496 6.68939 13.6782 6.74262 13.8122 6.74262C13.9462 6.74262 14.0747 6.68939 14.1695 6.59463C14.2642 6.49987 14.3174 6.37135 14.3174 6.23734V5.73206H14.8227C14.9567 5.73206 15.0853 5.67882 15.18 5.58406C15.2748 5.48931 15.328 5.36079 15.328 5.22678C15.328 5.09277 15.2748 4.96425 15.18 4.86949C15.0853 4.77473 14.9567 4.72149 14.8227 4.72149Z"
                      fill="white"
                    />
                  </svg>
                  Intervue Poll
                </div>
              </div>

              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>

              <p className="text-lg font-medium text-center">
                Wait for the teacher to ask questions..
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full justify-center flex-col items-center gap-y-6 p-6">
          <span className="px-3 py-1 gap-1 flex bg-[#7565D9] text-white rounded-full text-sm font-medium">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.8016 8.76363C12.8028 8.96965 12.7402 9.17098 12.6223 9.33992C12.5044 9.50887 12.337 9.63711 12.1432 9.707L8.88111 10.907L7.68107 14.1671C7.6101 14.3604 7.48153 14.5272 7.31274 14.645C7.14394 14.7628 6.94305 14.826 6.7372 14.826C6.53135 14.826 6.33045 14.7628 6.16166 14.645C5.99286 14.5272 5.8643 14.3604 5.79333 14.1671L4.59076 10.9111L1.33017 9.71104C1.13711 9.63997 0.970488 9.5114 0.852794 9.34266C0.735101 9.17392 0.671997 8.97315 0.671997 8.76742C0.671997 8.56169 0.735101 8.36092 0.852794 8.19218C0.970488 8.02345 1.13711 7.89487 1.33017 7.82381L4.59227 6.62376L5.79232 3.36418C5.86339 3.17112 5.99196 3.0045 6.1607 2.88681C6.32943 2.76911 6.53021 2.70601 6.73593 2.70601C6.94166 2.70601 7.14244 2.76911 7.31117 2.88681C7.47991 3.0045 7.60848 3.17112 7.67955 3.36418L8.8796 6.62629L12.1392 7.82633C12.3328 7.8952 12.5003 8.02223 12.6189 8.19003C12.7375 8.35782 12.8013 8.55817 12.8016 8.76363ZM9.26462 2.70024H10.2752V3.71081C10.2752 3.84482 10.3284 3.97334 10.4232 4.06809C10.5179 4.16285 10.6465 4.21609 10.7805 4.21609C10.9145 4.21609 11.043 4.16285 11.1378 4.06809C11.2325 3.97334 11.2858 3.84482 11.2858 3.71081V2.70024H12.2963C12.4303 2.70024 12.5588 2.64701 12.6536 2.55225C12.7484 2.45749 12.8016 2.32897 12.8016 2.19496C12.8016 2.06095 12.7484 1.93243 12.6536 1.83767C12.5588 1.74291 12.4303 1.68968 12.2963 1.68968H11.2858V0.679111C11.2858 0.545101 11.2325 0.416581 11.1378 0.321822C11.043 0.227063 10.9145 0.173828 10.7805 0.173828C10.6465 0.173828 10.5179 0.227063 10.4232 0.321822C10.3284 0.416581 10.2752 0.545101 10.2752 0.679111V1.68968H9.26462C9.13061 1.68968 9.00209 1.74291 8.90733 1.83767C8.81257 1.93243 8.75934 2.06095 8.75934 2.19496C8.75934 2.32897 8.81257 2.45749 8.90733 2.55225C9.00209 2.64701 9.13061 2.70024 9.26462 2.70024ZM14.8227 4.72137H14.3174V4.21609C14.3174 4.08208 14.2642 3.95356 14.1695 3.8588C14.0747 3.76404 13.9462 3.71081 13.8122 3.71081C13.6782 3.71081 13.5496 3.76404 13.4549 3.8588C13.3601 3.95356 13.3069 4.08208 13.3069 4.21609V4.72137H12.8016C12.6676 4.72137 12.5391 4.77461 12.4443 4.86937C12.3496 4.96412 12.2963 5.09264 12.2963 5.22665C12.2963 5.36066 12.3496 5.48918 12.4443 5.58394C12.5391 5.6787 12.6676 5.73194 12.8016 5.73194H13.3069V6.23722C13.3069 6.37123 13.3601 6.49975 13.4549 6.59451C13.5496 6.68927 13.6782 6.7425 13.8122 6.7425C13.9462 6.7425 14.0747 6.68927 14.1695 6.59451C14.2642 6.49975 14.3174 6.37123 14.3174 6.23722V5.73194H14.8227C14.9567 5.73194 15.0853 5.6787 15.18 5.58394C15.2748 5.48918 15.328 5.36066 15.328 5.22665C15.328 5.09264 15.2748 4.96412 15.18 4.86937C15.0853 4.77461 14.9567 4.72137 14.8227 4.72137Z"
                fill="white"
              />
            </svg>
            Intervue Poll
          </span>
          <h2 className="text-3xl font-semibold text-center">
            Let's <span className="font-bold">Get Started</span>
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            If you're a student, you'll be able to{" "}
            <strong>submit your answers</strong>, participate in live polls, and
            see how your responses compare with your classmates.
          </p>

          <div className="w-full md:w-[40%]">
            <label className="block text-gray-700 font-medium mb-2">
              Enter your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            className={`bg-gradient-to-r from-[#7565D9] to-[#5e0cf7] text-white h-12 w-[20%] md:w-1/5 rounded-xl font-semibold transition ${
              !name.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"
            }`}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Student;