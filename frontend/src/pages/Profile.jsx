import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ user, handleLogout }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>Welcome to Your Profile</h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h2>User Information</h2>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>

        {user.first_name && (
          <p>
            <strong>First Name:</strong> {user.first_name}
          </p>
        )}
        {user.last_name && (
          <p>
            <strong>Last Name:</strong> {user.last_name}
          </p>
        )}

        <button
          onClick={onLogout}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
