import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from './config';


// TODO: handle guest users
// TODO: Add timestamp to the messages

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(sessionStorage.getItem("username") || "");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // FIXME: if(!token || !username) => f(!token) debug login and signup user has no username when running this
    if(!token){
      console.log('no token')
      navigate('/login') // Redirect to login if token is missing
      return;
    }

    // Initialize socket connection
    // Avoid multiple socket connections
    if (!socket) {
      const newSocket = io(API_BASE_URL,{
      query: { token }  // Send token in the query
    }); // Connect to the backend

    // Handle incoming messages
    newSocket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("user_joined", (data) => {
      if (data.username.startswith('Guest')){
        sessionStorage.setItem("username", data.username)
      }
      setUsername(data.username)
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("user_left", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("auth_error", (err) => {
      // TODO: make it a flash or warning
      console.error(err)
      localStorage.removeItem("token");
      navigate("/login");
    });

    setSocket(newSocket);}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
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
