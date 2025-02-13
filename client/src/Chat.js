import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Connect to the backend

// TODO: 1. Set username if new coming user is not Set
//       2. add event to handle user joint
//       3. add event to handle user left
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUserSet, setIsUserSet] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("username_confirmed", (data) => console.log(`${data.username} is set`));

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

  const sendNewUser = (e) => {
    e.preventDefault();
    socket.emit("set_username", {username});
    setIsUserSet(true);

  };
  // TODO: build a form than prompt user to enter username if not set
  //       and a function that send user name to the server
  //       localStorage
  return (
    <div>
      {isUserSet?
      (<div>
        <h2>Chat</h2>
        <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {messages.map((data, index) =>{

            return <p key={index}>{data.msg}</p>

        }

        )}
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
              <button type="submit">Join the Chat</button>
           </form>
          </div>)}
    </div>
  );
};

export default Chat;
