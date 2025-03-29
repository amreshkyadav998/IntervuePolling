# Live Polling Application

## Overview

The Live Polling Application is a real-time polling system designed for classroom or event settings. It allows teachers to create and publish polls, and students to participate and view results in real-time. The application is built using React for the frontend, and Node.js with Express and Socket.io for the backend, ensuring a responsive and interactive experience.

## Demo

Watch the [video demonstration](https://drive.google.com/file/d/1_p12dGJwolYJzl4ts1Z6-hMcdfxi1CKq/view?usp=sharing) to see how the Live Polling Application works.

## Features

### Teacher Interface
- **Create Polls:** Teachers can create new polls with custom questions and multiple-choice options.
- **Set Timer:** Teachers can set a custom timer for each question, controlling how long students have to respond.
- **View Live Results:** Real-time display of poll results as students submit their answers.
- **Ask Another Question:** Easily transition to new questions and reset the poll interface.

### Student Interface
- **Enter Name:** Students can enter their names to participate uniquely per session.
- **Answer Polls:** Students can select and submit their answers to active polls.
- **View Results:** Real-time results displayed after the poll timer expires or when they have submitted their answers.
- **Timer Countdown:** Visual countdown indicating the remaining time to answer each question.

### Real-time Communication
- **Socket.io Integration:** Ensures instant updates and synchronization between teacher and student interfaces.
- **Student Validation:** Tracks student responses to prevent multiple submissions and ensures data integrity.

## Technologies Used

### Frontend
- **React:** For building a dynamic and responsive user interface.
- **React Bootstrap:** For styling and layout components.
- **Socket.io Client:** For real-time communication with the backend.

### Backend
- **Node.js:** For server-side scripting.
- **Express:** For handling HTTP requests and setting up the server.
- **Socket.io:** For real-time, bi-directional communication between clients and server.
- **Cors:** For handling cross-origin resource sharing.


### Usage

1. **Teacher Role:**
   - Access the application and select the "Teacher" role.
   - Create a new poll by entering a question and multiple options.
   - Set a custom timer for the poll.
   - Publish the poll and monitor real-time results as students respond.

2. **Student Role:**
   - Access the application and select the "Student" role.
   - Enter your name to participate.
   - Answer active polls and view real-time results after submission or when the timer expires.

## Contact

For any inquiries or feedback, please contact [dhirajudhani870@gmail.com].