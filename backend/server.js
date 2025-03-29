const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app);

// Enable CORS for API requests
app.use(cors({ 
  origin: process.env.NODE_ENV === "production" 
    ? true  // Allow any origin in production (will respect CORS headers)
    : "http://localhost:5173", // Development origin
  methods: ["GET", "POST"] 
}));

// Serve frontend files in production
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname1, "dist", "index.html"));
  });
}

// Initialize Socket.IO with CORS handling
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? true  // Allow any origin in production
      : "http://localhost:5173", // Development origin
    methods: ["GET", "POST"],
  },
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Store polling data
let currentQuestion = {};
const connectedStudents = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send current question state to newly connected users
  if (currentQuestion.question) {
    socket.emit("new-question", currentQuestion);
  }

  // Handle teacher asking a question
  socket.on("teacher-ask-question", (questionData) => {
    const { question, options, timer, correctAnswer } = questionData;
    
    // Reset student voting status when new question is asked
    for (let [id, student] of connectedStudents.entries()) {
      student.voted = false;
      connectedStudents.set(id, student);
    }
    
    currentQuestion = {
      question,
      options,
      optionsFrequency: options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
      answered: false,
      results: {},
      timer,
      correctAnswer,
    };
    
    io.emit("new-question", currentQuestion);
    io.emit("student-vote-validation", Array.from(connectedStudents.values()));
    
    // Automatically end poll after the timer
    setTimeout(() => {
      if (!currentQuestion.answered) {
        calculateResults();
      }
    }, timer * 1000);
  });
  
  // Handle polling responses
  socket.on("handle-polling", ({ option }) => {
    if (currentQuestion.options?.includes(option)) {
      // Check if student has already voted
      const student = connectedStudents.get(socket.id);
      
      if (student && !student.voted) {
        currentQuestion.optionsFrequency[option] += 1;
        
        // Mark student as voted
        student.voted = true;
        connectedStudents.set(socket.id, student);
        
        // Only send vote validation update to all clients
        io.emit("student-vote-validation", Array.from(connectedStudents.values()));
        
        // Calculate results but only send to the student who voted
        const individualResults = calculatePartialResults();
        socket.emit("individual-polling-results", individualResults);
        
        // Check if all students have voted
        const allVoted = [...connectedStudents.values()].every(student => student.voted);
        if (allVoted && connectedStudents.size > 0) {
          finalizeResults();
        }
      }
    }
  });
  
  // Handle student joining with a name
  socket.on("student-set-name", ({ name }) => {
    // Check if name already exists
    let uniqueName = name;
    let counter = 1;
    
    while ([...connectedStudents.values()].some(student => student.name === uniqueName && student.socketId !== socket.id)) {
      uniqueName = `${name} (${counter})`;
      counter++;
    }
    
    connectedStudents.set(socket.id, { 
      name: uniqueName, 
      socketId: socket.id, 
      voted: false 
    });
    
    console.log(`Student ${uniqueName} connected`);
    io.emit("student-connected", Array.from(connectedStudents.values()));
    socket.emit("student-vote-validation", Array.from(connectedStudents.values()));
  });
  
  // Handle student disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedStudents.delete(socket.id);
    io.emit("student-disconnected", Array.from(connectedStudents.values()));
    
    // Recalculate results if a student disconnects and poll is active
    if (currentQuestion.question && !currentQuestion.answered) {
      const allVoted = [...connectedStudents.values()].every(student => student.voted);
      if (allVoted && connectedStudents.size > 0) {
        finalizeResults();
      }
    }
  });
});

// Function to calculate partial results for an individual student
const calculatePartialResults = () => {
  const totalResponses = Object.values(currentQuestion.optionsFrequency).reduce((sum, count) => sum + count, 0);
  
  const results = {};
  if (totalResponses > 0) {
    Object.keys(currentQuestion.optionsFrequency).forEach((option) => {
      results[option] = ((currentQuestion.optionsFrequency[option] / totalResponses) * 100).toFixed(2);
    });
  }
  
  return {
    ...currentQuestion,
    results,
    answered: false, // Keep as false for individual results
  };
};

// Function to finalize and broadcast results to everyone
const finalizeResults = () => {
  const results = calculatePartialResults();
  results.answered = true; // Mark as answered for everyone
  currentQuestion = results;
  io.emit("polling-results", results);
};

// Original function, now used when timer expires
const calculateResults = () => {
  finalizeResults();
};