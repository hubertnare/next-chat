import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Message from "./Message/";

function Messages({ messages, username }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <StyledMessages>
      {messages.map((message, index) => (
        <div key={index}>
          <Message message={message} username={username} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </StyledMessages>
  );
}

export default Messages;

const StyledMessages = styled.div`
  padding: 5% 0;
  overflow: auto;
  flex: auto;
`;