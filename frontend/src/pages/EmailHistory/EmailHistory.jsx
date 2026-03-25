import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import axios from "../../utils/axiosConfig";
import "./EmailHistory.scss";

const EmailHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchHistory = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("/auth/email-history/");
        const data = response.data.history;
        setHistory(data);
        setFilteredHistory(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch history");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter history based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(history);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = history.filter(
        (email) =>
          email.to?.toLowerCase().includes(term) ||
          email.subject?.toLowerCase().includes(term) ||
          email.body_preview?.toLowerCase().includes(term)
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 1) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else if (diffDays < 7) {
        return format(date, "EEEE, h:mm a");
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch {
      return isoString;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show a temporary tooltip/notification – you could use a toast library
    alert("Email address copied to clipboard!");
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
  };

  const handleRetry = () => {
    fetchHistory();
  };

  const handleRefresh = () => {
    fetchHistory(true);
  };

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span> Back
          </button>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className={`refresh-icon ${isRefreshing ? "spin" : ""}`}>
              ↻
            </span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="history-header">
          <div className="history-icon">📬</div>
          <h1 className="history-title">Sent Emails</h1>
          <p className="history-subtitle">Your last sent excuses</p>
        </div>

        {/* Search bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by recipient, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="history-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="history-skeleton">
                <div className="skeleton-header"></div>
                <div className="skeleton-subject"></div>
                <div className="skeleton-preview"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={handleRetry} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!isLoading && filteredHistory.length === 0 && (
          <div className="history-empty">
            <div className="empty-illustration">
              <span className="empty-icon">📭</span>
            </div>
            <h3>No emails sent yet</h3>
            <p>Your sent emails will appear here once you send an excuse.</p>
            <button className="generate-btn" onClick={() => navigate("/write")}>
              ⚡ Write your first excuse
            </button>
          </div>
        )}

        {!isLoading && filteredHistory.length > 0 && (
          <div className="history-list">
            {filteredHistory.map((email) => (
              <div
                key={email.id}
                className="history-item"
                onClick={() => handleEmailClick(email)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && handleEmailClick(email)}
              >
                <div className="history-item-header">
                  <div className="history-to">
                    <span className="to-icon">📧</span>
                    <span
                      className="email-address"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(email.to);
                      }}
                      title="Click to copy"
                    >
                      {email.to}
                    </span>
                  </div>
                  <span className="history-date">
                    {formatDate(email.sent_at)}
                  </span>
                </div>
                <div className="history-subject">
                  <span className="subject-icon">📌</span>
                  {email.subject}
                </div>
                <p className="history-preview">{email.body_preview}</p>
                <div className="history-actions">
                  <button
                    className="action-btn copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(email.to);
                    }}
                    title="Copy email address"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for full email content */}
        {showModal && selectedEmail && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Email Details</h3>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>To:</strong> {selectedEmail.to}
                </div>
                <div className="detail-row">
                  <strong>Subject:</strong> {selectedEmail.subject}
                </div>
                <div className="detail-row">
                  <strong>Sent:</strong>{" "}
                  {format(new Date(selectedEmail.sent_at), "PPPPpp")}
                </div>
                <div className="detail-row full-email">
                  <strong>Body:</strong>
                  <div className="email-body">{selectedEmail.body_preview}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="copy-email-btn"
                  onClick={() => copyToClipboard(selectedEmail.to)}
                >
                  Copy Email Address
                </button>
                <button className="modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailHistory;
