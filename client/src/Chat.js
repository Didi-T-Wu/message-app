import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from './config';

const token = localStorage.getItem('token');
const socket = io(API_BASE_URL,{
  query: { token }  // Send token in the query
}); // Connect to the backend

// TODO: handle guest users
// TODO: Add timestamp to the messages
// FIXME: Don't need set_username, after login or sign in, users will be directing to chat.
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('')

  useEffect(() => {
    socket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user_joined", (data) => {
      setUsername(data.username)
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user_left", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // TODO: sucket.on("error")


    return () => {
      socket.off("message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message',{ 'msg':message, 'username':username }); // Emit a message event
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat</h2>
        <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {messages.map((data, index) =>{
          if(data.system){
            return <strong key={index}><p >{data.msg}</p></strong>
          }else{
            return <p key={index}><strong>{data.username}</strong> says : {data.msg}</p>
          }})}
        </div>
        <form onSubmit={sendMessage}>
         <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
         />
         <button
          type="submit"
          disabled={!message.trim()}
          >
            Send
          </button>
        </form>
    </div>
  );
};

export default Chat;
