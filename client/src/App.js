import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css';

import Chat from './Chat';
import Login from './login/Login';
import Signup from './signup/Signup';
import Home from './Home'


function App() {

  return (
    <div className="App">
      <h1>React + Flask SocketIO</h1>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/home" element={<Home/>} />
      </Routes>
    </div>
  );
}

export default App;
