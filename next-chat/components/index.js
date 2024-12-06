import React, { useEffect, useState } from "react";
import { Input } from "antd";
import "antd/dist/antd.css";
import "font-awesome/css/font-awesome.min.css";
import socketIOClient from "socket.io-client";
import Header from "./Header";
import Messages from "./Messages";
import List from "./List";
import {
  ChatContainer,
  StyledContainer,
  ChatBox,
  StyledButton,
  SendIcon,
} from "../pages/chat/styles";

function ChatRoom({ username, id }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const io = socketIOClient("http://localhost:1337");

  useEffect(() => {
    // Emit "join" event to backend
    io.emit("join", { username }, (error) => {
      if (error) alert(error);
    });

    // Listen for welcome message
    io.on("welcome", async (data) => {
      const welcomeMessage = { user: data.user, message: data.text };
      setMessages([welcomeMessage]);

      try {
        const res = await fetch("http://localhost:1337/api/messages");
        const response = await res.json();
        setMessages((msgs) => [
          ...msgs,
          ...response.data.map((msg) => msg.attributes),
        ]);
      } catch (error) {
        console.error("Error fetching messages:", error.message);
      }
    });

    // Listen for "message" event
    io.on("message", (data) => {
      setMessages((msgs) => [...msgs, { user: data.user, message: data.text }]);
    });

    // Fetch active users
    io.on("roomData", async () => {
      try {
        const res = await fetch("http://localhost:1337/api/active-users");
        const usersData = await res.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching active users:", error.message);
      }
    });

    return () => io.disconnect(); // Cleanup on component unmount
  }, [username]);

  const sendMessage = () => {
    if (message) {
      io.emit("sendMessage", { message, user: username });
      setMessage("");
    } else {
      alert("Message can't be empty");
    }
  };

  return (
    <ChatContainer>
      <Header room="Group Chat" />
      <StyledContainer>
        <List users={users} id={id} username={username} />
        <ChatBox>
          <Messages messages={messages} username={username} />
          <Input
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <StyledButton onClick={sendMessage}>
            <SendIcon>
              <i className="fa fa-paper-plane" />
            </SendIcon>
          </StyledButton>
        </ChatBox>
      </StyledContainer>
    </ChatContainer>
  );
}

export default ChatRoom;