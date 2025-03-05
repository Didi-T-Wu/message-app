import React, { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from './config';
import { AuthContext } from "./AuthProvider";



// TODO: Add timestamp to the messages
// handle multiple users, curUser, aware that users and token stored in localStorage
// curUser stored in sessionStorage
// users: { username: token ...} , curUser: username, token:`token_${username}`:token
// TODO: handle logout in user_left
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const {curUser, getCurUserToken} = useContext(AuthContext)

  useEffect(() => {
    //load curUser(username) and token'
    const curUserToken = getCurUserToken(curUser)

    console.log('token from localStorage in useEffect in Chat.js', curUserToken)
    if(!curUserToken){
      console.log('no token')
      navigate('/login') // Redirect to login if token is missing
      return;
    }

    // Initialize socket connection
    // Avoid multiple socket connections
    // TODO: but I want to handle multiple users from different tabs
    if (!socket) {
      console.log('Initialize socket connection in useEffect in Chat.js')
      const newSocket = io(API_BASE_URL,{
      query: { token:curUserToken }
    }); // Connect to the backend

    // Handle incoming messages
    newSocket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("user_joined", (data) => {
      console.log("Received data:", data);
      console.log("Username type:", typeof data.username);

      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("user_left", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("auth_error", (err) => {
      // TODO: make it a flash or warning
      console.error(err)
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
      socket.emit('message',{ 'msg':message, 'username':curUser }); // Emit a message event
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
