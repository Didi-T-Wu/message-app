import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Connect to the backend

// TODO: 1. Set username if new coming user is not Set
//       2. add event to handle user joint
//       3. add event to handle user left
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.send(message); // Emit a message event
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
