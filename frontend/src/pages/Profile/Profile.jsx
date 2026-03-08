import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.scss";
import { Link } from "react-router-dom";
const Profile = ({ user, handleLogout }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  // Format user info for display
  const userInfo = [
    { label: "Username", value: user.username, icon: "👤" },
    { label: "Email", value: user.email, icon: "📧" },
    { label: "User ID", value: `#${user.id}`, icon: "🆔" },
    {
      label: "First Name",
      value: user.first_name || "Not provided",
      icon: "👨",
      optional: true,
    },
    {
      label: "Last Name",
      value: user.last_name || "Not provided",
      icon: "👪",
      optional: true,
    },
    {
      label: "Account Type",
      value: user.is_staff ? "Administrator" : "Standard User",
      icon: "🎯",
    },
    {
      label: "Status",
      value: user.is_active ? "Active" : "Inactive",
      icon: user.is_active ? "🟢" : "🔴",
    },
  ];

  // Get registration date or use current date as fallback
  const registrationDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="avatar-status"></div>
        </div>
        <h1 className="profile-greeting">
          Welcome back, <span className="highlight">{user.username}</span>!
        </h1>
        <p className="profile-subtitle">Here's your account information</p>
      </div>

      <div className="profile-content">
        <div className="action-section">
          <div className="quick-actions">
            <h3 className="actions-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn edit-btn">
                <span className="action-icon">✏️</span>
                Edit Profile
              </button>
              <button className="action-btn settings-btn">
                <span className="action-icon">⚙️</span>
                Settings
              </button>
              <button className="action-btn security-btn">
                <span className="action-icon">🔐</span>
                Security
              </button>
              {/* <button className="action-btn help-btn">
                <span className="action-icon">❓</span>
                Help Center
              </button> */}
              <Link to={"/feedback"} className="action-btn help-btn">
                <span className="action-icon">💬</span>
                Feedback
              </Link>

              {/* New History and Write Excuse buttons */}
              <Link to="/history" className="action-btn history-btn">
                <span className="action-icon">📜</span>
                View History
              </Link>
              <Link to="/write-excuse" className="action-btn write-excuse-btn">
                <span className="action-icon">📝</span>
                Write Excuse
              </Link>
              {/* <Link to="/history"></Link> */}
            </div>
          </div>

          <div className="logout-section">
            <div className="logout-warning">
              <span className="warning-icon">⚠️</span>
              <p>Logging out will end your current session.</p>
            </div>
            <button onClick={onLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Logout from all devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
