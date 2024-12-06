import React from "react";
import styled from "styled-components";
import { List as AntdList, Avatar } from "antd";
import socket from "socket.io-client";

function List(props) {
  const users = props.users.data; // Strapi 5 no longer uses `attributes`, so data is already structured directly.

  const handleClick = async (id, socketid) => {
    const io = socket("http://localhost:1337");

    try {
      // Delete user from active users collection
      await fetch(`http://localhost:1337/api/active-users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      // Emit "kick" event to disconnect the user
      io.emit("kick", { socketid }, (error) => {
        if (error) return alert("Failed to kick user:", error);
      });

      // Refresh the page after a short delay
      setTimeout(() => location.reload(), 3000);
    } catch (error) {
      console.error("Error deleting user:", error.message);
      setTimeout(() => location.reload(), 3000);
    }
  };

  return (
    <StyledList>
      <ListHeading>Active Users</ListHeading>
      <AntdList
        itemLayout="horizontal"
        dataSource={users}
        renderItem={(user) => (
          <AntdList.Item>
            <AntdList.Item.Meta
              avatar={
                <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
              }
              title={user.users} // Directly access the `users` field.
            />
            <button
              style={
                user.users === "Admin" || props.username !== "Admin"
                  ? { display: "none" }
                  : null
              }
              onClick={() => handleClick(user.id, user.socketid)} // Use `user.id` and `user.socketid`.
            >
              Delete
            </button>
          </AntdList.Item>
        )}
      />
    </StyledList>
  );
}

export default List;

// Styled Components
const StyledList = styled(AntdList)`
  margin-right: 10px;
  flex: 0 0 35%;
  padding: 20px;
`;

const ListHeading = styled.div`
  color: #757591;
  font-size: 20px;
  font-style: oblique;
  border-bottom: 1px solid #757591;
`;