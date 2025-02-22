import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from './config';

const socket = io(API_BASE_URL); // Connect to the backend
// TODO: handle guest users
// TODO: Add timestamp to the messages
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUserSet, setIsUserSet] = useState(()=> !!localStorage.getItem('username') );
  const [username, setUsername] = useState(()=> localStorage.getItem('username') || '');


  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user_left", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });


    socket.on("username_set", (data) => {
      console.log(`${data.username} is set`)
      localStorage.setItem('username',data.username)
      localStorage.setItem('user_id', data.user_id)
      setIsUserSet(true)
    });

    return () => {
      socket.off("message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("username_set")
    };
  }, []);

  // Automatically send stored username when the page reloads
// FIXME: This causes username form submit after type in one character
  // useEffect(() => {
  //   if (username && !isUserSet) {
  //     socket.emit("set_username", { username });
  //     setIsUserSet(true);
  //   }
  // }, [username, isUserSet]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message',{ 'msg':message, 'user_id':localStorage.getItem('user_id', '') }); // Emit a message event
      setMessage("");
    }
  };

  const sendNewUser = (e) => {
    e.preventDefault();
    if (username.trim() === "") return;
    socket.emit("set_username", { username });
  };

  return (
    <div>
      {isUserSet?
      (<div>
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
        </div>):(
          <div>
            <h2>Set User Name</h2>
            <form onSubmit={sendNewUser}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Type your username..."

            />
              <button
                type="submit"
                disabled={!username.trim()}
                >
                  Join the Chat
              </button>
           </form>
          </div>)}
    </div>
  );
};

export default Chat;
