import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.scss";
import { Link } from "react-router-dom";
import usericon from "../../assets/usericon.jpg";
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
            <img src={usericon} alt="user" />
          </div>
          <div className="avatar-status"></div>
        </div>
        <h1 className="profile-greeting">
          Wsp gng, <span className="highlight">{user.username}</span>!
        </h1>
        <p className="profile-subtitle">If it doesnt work, just refresh it </p>
      </div>

      <div className="profile-content">
        <div className="action-section">
          <div className="quick-actions">
            <h3 className="actions-title">Quick Actions</h3>
            <div className="actions-grid">
              {/* <button className="action-btn edit-btn">
                <span className="action-icon">✏️</span>
                Edit Profile
              </button>
              <button className="action-btn settings-btn">
                <span className="action-icon">⚙️</span>
                Settings
              </button> */}

              <Link to={"/security"} className="action-btn security-btn">
                <span className="action-icon">🔐</span>
                Security
              </Link>
              {/* <button className="action-btn help-btn">
                <span className="action-icon">❓</span>
                Help Center
              </button> */}
              <Link
                state={{ user: user }}
                to={"/feedback"}
                className="action-btn help-btn"
              >
                <span className="action-icon">💬</span>
                Feedback
              </Link>

              {/* New History and Write Excuse buttons */}
              <Link to="/email-history" className="action-btn history-btn">
                <span className="action-icon">📜</span>
                View History
              </Link>
              {/* {sendSuccess && (
                <div className="success-message">
                  ✅ Sent to {emailTo}!{" "}
                  <span
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate("/email-history")}
                  >
                    View history →
                  </span>
                </div>
              )} */}
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
        <div className="dev-section">
          <p>⚠️ Problems? Hit me direct. New ideas. Projects. No bullshit.</p>
          <div className="social-links">
            <a href="https://t.me/aziz_wth" className="tg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.66-.35-1.02.22-1.61.15-.15 2.71-2.48 2.76-2.69.01-.03.02-.14-.05-.2-.07-.06-.18-.04-.26-.02-.11.02-1.86 1.18-5.26 3.48-.5.34-.95.51-1.36.5-.45-.01-1.31-.25-1.95-.46-.78-.25-1.4-.38-1.35-.81.03-.22.33-.45.91-.68 3.59-1.56 5.98-2.59 7.18-3.08 3.42-1.41 4.13-1.65 4.59-1.66.1 0 .33.02.48.15.12.11.16.26.17.4-.01.05-.02.13-.03.2z" />
              </svg>
              Telegram
            </a>
            <a href="https://instagram.com/aziz_wth" className="ig">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
            </a>
            <a href="https://snapchat.com/add/azizakhmedov2" className="sc">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.02-1.99 2.13-3.48 4.5-3.48 2.37 0 4.48 1.49 4.5 3.48-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              Snapchat
            </a>
          </div>
          <small>
            — You can't say i gave up without saying "I GAY"... so don't!!
          </small>
        </div>
      </div>
    </div>
  );
};

export default Profile;
