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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list");

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
        const data = response.data.history || [];
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

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          (email.to && email.to.toLowerCase().includes(term)) ||
          (email.subject && email.subject.toLowerCase().includes(term)) ||
          (email.body_preview &&
            email.body_preview.toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.sent_at || a.created_at);
      const dateB = new Date(b.sent_at || b.created_at);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, sortOrder]);

  const formatDate = (isoString) => {
    try {
      if (!isoString) return "Date not available";
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

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification("Email address copied to clipboard!");
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

  const getInitials = (email) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="email-history-container">
      <div className="email-history-card">
        {/* Toast Notification */}
        {showToast && (
          <div className="toast-notification">
            <span className="toast-icon">✓</span>
            {toastMessage}
          </div>
        )}

        {/* Header Section */}
        <div className="history-header-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span>
            Back
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
          <div className="history-icon-wrapper">
            <span className="history-icon">📬</span>
          </div>
          <h1 className="history-title">Sent Emails</h1>
          <p className="history-subtitle">Your last sent excuses</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-info">
              <div className="stat-value">{history.length}</div>
              <div className="stat-label">Total Sent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div className="stat-info">
              <div className="stat-value">
                {
                  history.filter((e) => {
                    if (!e.sent_at && !e.created_at) return false;
                    const daysAgo =
                      (new Date() - new Date(e.sent_at || e.created_at)) /
                      (1000 * 60 * 60 * 24);
                    return daysAgo <= 7;
                  }).length
                }
              </div>
              <div className="stat-label">Last 7 Days</div>
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="controls-section">
          <div className="search-wrapper">
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

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              ☰
            </button>
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              ⊞
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="sort-controls">
          <button
            className={`sort-btn ${sortOrder === "desc" ? "active" : ""}`}
            onClick={() => setSortOrder("desc")}
          >
            Newest First
          </button>
          <button
            className={`sort-btn ${sortOrder === "asc" ? "active" : ""}`}
            onClick={() => setSortOrder("asc")}
          >
            Oldest First
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your emails...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredHistory.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No emails found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search term"
                : "Start sending excuses to see them here"}
            </p>
            {searchTerm && (
              <button
                className="clear-filters-btn"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            )}
            {!searchTerm && (
              <button
                className="generate-btn"
                onClick={() => navigate("/write")}
              >
                ⚡ Write Your First Excuse
              </button>
            )}
          </div>
        )}

        {/* Email List */}
        {!isLoading && filteredHistory.length > 0 && (
          <div className={`emails-container ${viewMode}`}>
            {filteredHistory.map((email) => (
              <div
                key={email.id}
                className="email-card"
                onClick={() => handleEmailClick(email)}
              >
                {viewMode === "list" ? (
                  // List View
                  <>
                    <div className="card-avatar">
                      <div className="avatar-circle">
                        {getInitials(email.to)}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <div className="recipient-info">
                          <span className="recipient-email">{email.to}</span>
                        </div>
                        <div className="card-meta">
                          <span className="date">
                            {formatDate(email.sent_at || email.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="card-subject">
                        <strong>{email.subject}</strong>
                      </div>
                      <div className="card-preview">{email.body_preview}</div>
                      <div className="card-actions">
                        <button
                          className="action-copy"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(email.to);
                          }}
                        >
                          📋 Copy Email
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Grid View
                  <div className="grid-content">
                    <div className="grid-recipient">
                      <div className="grid-avatar">{getInitials(email.to)}</div>
                      <span className="recipient-email">{email.to}</span>
                    </div>
                    <div className="grid-subject">{email.subject}</div>
                    <div className="grid-preview">
                      {email.body_preview &&
                        email.body_preview.substring(0, 80)}
                      {email.body_preview &&
                        email.body_preview.length > 80 &&
                        "..."}
                    </div>
                    <div className="grid-footer">
                      <span className="grid-date">
                        {formatDate(email.sent_at || email.created_at)}
                      </span>
                      <button
                        className="grid-copy"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(email.to);
                        }}
                        title="Copy email"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!isLoading && filteredHistory.length > 0 && (
          <div className="history-footer">
            <div className="footer-stats">
              <span>
                Showing {filteredHistory.length} of {history.length} emails
              </span>
              {searchTerm && (
                <button
                  className="clear-all-filters"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Email Detail Modal */}
        {showModal && selectedEmail && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Email Details</h3>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-field">
                  <label>To:</label>
                  <div className="field-value with-copy">
                    <span>{selectedEmail.to}</span>
                    <button
                      className="copy-field"
                      onClick={() => copyToClipboard(selectedEmail.to)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="modal-field">
                  <label>Subject:</label>
                  <div className="field-value">{selectedEmail.subject}</div>
                </div>
                <div className="modal-field">
                  <label>Sent:</label>
                  <div className="field-value">
                    {format(
                      new Date(
                        selectedEmail.sent_at || selectedEmail.created_at
                      ),
                      "PPPP 'at' p"
                    )}
                  </div>
                </div>
                <div className="modal-field">
                  <label>Body:</label>
                  <div className="email-body">{selectedEmail.body_preview}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-btn secondary" onClick={closeModal}>
                  Close
                </button>
                <button
                  className="modal-btn primary"
                  onClick={() => {
                    copyToClipboard(selectedEmail.to);
                  }}
                >
                  Copy Email Address
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
