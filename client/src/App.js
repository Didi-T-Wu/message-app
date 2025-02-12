import React, {useEffect, useState}from 'react';
import './App.css';
import Chat from './Chat';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');


function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    socket.on('welcome', (data) => {
      console.log('Welcome message:', data.message);
      setWelcomeMessage(data.message);
    });

    // Send request to backend after connection
    socket.emit('request_welcome', { data: 'User connected' });

    return () => {
      socket.off('welcome');
    };
  }, []);

  return (
    <div className="App">
      <h1>React + Flask SocketIO</h1>
      <p>{welcomeMessage}</p>
      <Chat />
    </div>
  );
}

export default App;
