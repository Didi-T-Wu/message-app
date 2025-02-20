import React, {useEffect, useState}from 'react';
import { Routes, Route } from 'react-router-dom'
import './App.css';
import { io } from 'socket.io-client';

import Chat from './Chat';
import Login from './login/Login';
import Signup from './signup/Signup';

const socket = io('http://localhost:5001');


function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    socket.on('welcome', (data) => {
      console.log('Welcome message:', data.msg);
      setWelcomeMessage(data.msg);
    });

    // Send request to backend after connection
    socket.emit('request_welcome', { msg: 'User connected' });

    return () => {
      socket.off('welcome');
    };
  }, []);

  return (
    <div className="App">
      <h1>React + Flask SocketIO</h1>
      <p>{welcomeMessage}</p>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
    </div>
  );
}

export default App;
