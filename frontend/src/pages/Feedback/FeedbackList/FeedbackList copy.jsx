import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FeedbackList.scss";

const FeedbackList = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [displayedFeedbacks, setDisplayedFeedbacks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Authentication state
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Categories with proper API value mapping
  const categories = [
    { id: "all", label: "All", icon: "📋", color: "#4361ee", apiValue: "all" },
    { id: "bug", label: "Bug", icon: "🐛", color: "#dc3545", apiValue: "Bug" },
    {
      id: "improvement",
      label: "Improvement",
      icon: "🚀",
      color: "#28a745",
      apiValue: "Improvement",
    },
    {
      id: "suggestion",
      label: "Suggestion",
      icon: "💡",
      color: "#ffc107",
      apiValue: "Suggestion",
    },
    {
      id: "feature",
      label: "Feature",
      icon: "✨",
      color: "#17a2b8",
      apiValue: "Feature",
    },
    {
      id: "other",
      label: "Other",
      icon: "📝",
      color: "#6c757d",
      apiValue: "Other",
    },
  ];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get category info for display
  const getCategoryInfo = (categoryName) => {
    if (!categoryName) return { icon: "📝", color: "#6c757d", label: "Other" };

    const category = categories.find(
      (c) =>
        c.apiValue.toLowerCase() === categoryName.toLowerCase() ||
        c.label.toLowerCase() === categoryName.toLowerCase()
    );

    return {
      icon: category?.icon || "📝",
      color: category?.color || "#6c757d",
      label: category?.label || categoryName,
    };
  };

  // Fetch feedbacks from API with authentication
  const fetchFeedbacks = async (page = 1, category = "all") => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let url = `http://127.0.0.1:8000/api/excuses/feedback/?page=${page}&page_size=${ITEMS_PER_PAGE}`;
      if (category !== "all") {
        url += `&feedbacktype=${category}`;
      }

      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let newFeedbacks = [];
      let total = 0;

      if (data.results) {
        newFeedbacks = data.results;
        total = data.count || data.results.length;
      } else if (Array.isArray(data)) {
        newFeedbacks = data;
        total = data.length;
      } else {
        newFeedbacks = data.data || [];
        total = data.total || newFeedbacks.length;
      }

      if (category !== "all" && newFeedbacks.length > 0) {
        newFeedbacks = newFeedbacks.filter((f) => {
          const feedbackCategory = f.feedbacktype || f.category || "";
          return feedbackCategory.toLowerCase() === category.toLowerCase();
        });
        total = newFeedbacks.length;
      }

      if (page === 1) {
        setFeedbacks(newFeedbacks);
        setDisplayedFeedbacks(newFeedbacks);
      } else {
        setFeedbacks((prev) => [...prev, ...newFeedbacks]);
        setDisplayedFeedbacks((prev) => [...prev, ...newFeedbacks]);
      }

      setHasMore(newFeedbacks.length === ITEMS_PER_PAGE);
      setTotalCount(total);
    } catch (err) {
      setError(`Failed to load feedback: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check user authentication and admin status
  const checkAdminStatus = async () => {
    const token = localStorage.getItem("access_token");

    console.log("🔑 Token found:", token ? "YES" : "NO");
    console.log("🔑 Token value:", token);

    if (!token) {
      setAuthLoading(false);
      setIsAdmin(false);
      navigate("/login");
      return;
    }

    try {
      console.log("📡 Calling /auth/me/ ...");

      const response = await fetch("http://127.0.0.1:8000/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 /auth/me/ response status:", response.status);

      if (response.status === 401) {
        console.warn("❌ 401 Unauthorized — token is invalid or expired");
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user info — status: ${response.status}`
        );
      }

      const user = await response.json();

      console.log(
        "👤 Full /auth/me/ JSON response:",
        JSON.stringify(user, null, 2)
      );
      console.log("👤 user.is_staff:", user.is_staff);
      console.log("👤 user.is_superuser:", user.is_superuser);
      console.log("👤 user.is_admin:", user.is_admin);
      console.log("👤 user.role:", user.role);

      const admin =
        user.is_staff === true ||
        user.is_superuser === true ||
        user.is_admin === true ||
        user.role === "admin" ||
        user.role === "Admin";

      console.log("✅ Final isAdmin value:", admin);

      setIsAdmin(admin);
    } catch (err) {
      console.error("🔥 Auth check error:", err);
      setIsAdmin(false);
      setError("Failed to verify permissions.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Delete feedback handler
  const handleDelete = async (id) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/excuses/feedback/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // Remove from local state
      const updatedFeedbacks = feedbacks.filter((f) => f.id !== id);
      setFeedbacks(updatedFeedbacks);
      setDisplayedFeedbacks(updatedFeedbacks);
      setTotalCount((prev) => prev - 1);

      setSuccessMessage("Feedback deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to delete feedback: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Load user info on mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Once admin is confirmed, fetch feedbacks
  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks(1, "all");
    }
  }, [isAdmin]);

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setFeedbacks([]);
    setDisplayedFeedbacks([]);

    const selectedCat = categories.find((c) => c.id === categoryId);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(1, apiCategory);
  };

  // Handle show more
  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    const selectedCat = categories.find((c) => c.id === selectedCategory);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(nextPage, apiCategory);
  };

  // If still checking authentication, show loading
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  // If not admin, show 403 Forbidden page
  if (!isAdmin) {
    return (
      <div className="forbidden-page">
        <div className="forbidden-card">
          <div className="forbidden-icon">🚫</div>
          <h1>403 - Access Denied for you ng</h1>
          <p>U bchass Ng why the fuck u opened ts page,</p>
          <p>ts shii is only for OG, u get urassss to homePage</p>
          <button onClick={() => navigate("/")} className="back-home-btn">
            Fuck off
          </button>
        </div>
      </div>
    );
  }

  // Admin view: render feedback list
  return (
    <div className="feedback-list-container">
      <div className="feedback-list-card">
        {/* Header with back button */}
        <div className="list-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span> Back
          </button>
          <div className="header-title">
            <span className="header-icon">📊</span>
            <h1>User Feedback</h1>
          </div>
          <p className="header-subtitle">
            {totalCount} feedback {totalCount === 1 ? "item" : "items"} received
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {successMessage}
          </div>
        )}

        {/* Category Filters */}
        <div className="filters-section">
          <div className="filters-scroll">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryFilter(category.id)}
                style={{
                  "--active-color": category.color,
                }}
              >
                <span className="filter-icon">{category.icon}</span>
                <span className="filter-label">{category.label}</span>
                {selectedCategory === category.id && (
                  <span className="filter-active-indicator"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Indicator */}
        {selectedCategory !== "all" && (
          <div className="active-filter-indicator">
            <span className="filter-indicator-icon">🔍</span>
            Showing only:{" "}
            <strong>
              {categories.find((c) => c.id === selectedCategory)?.label}
            </strong>{" "}
            feedback
            <button
              className="clear-filter-btn"
              onClick={() => handleCategoryFilter("all")}
            >
              Clear filter ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Feedback List */}
        <div className="feedback-items">
          {displayedFeedbacks.length === 0 && !isLoading ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No feedback yet</h3>
              <p>
                {selectedCategory === "all"
                  ? "Be the first to share your thoughts!"
                  : `No ${
                      categories.find((c) => c.id === selectedCategory)?.label
                    } feedback available`}
              </p>
              {selectedCategory !== "all" && (
                <button
                  className="view-all-btn"
                  onClick={() => handleCategoryFilter("all")}
                >
                  View All Feedback
                </button>
              )}
            </div>
          ) : (
            displayedFeedbacks.map((feedback, index) => {
              const categoryName =
                feedback.feedbacktype || feedback.category || "Other";
              const categoryInfo = getCategoryInfo(categoryName);

              return (
                <div key={feedback.id || index} className="feedback-item">
                  <div className="feedback-header">
                    <div className="feedback-category-wrapper">
                      <div
                        className="feedback-category"
                        style={{
                          backgroundColor: `${categoryInfo.color}20`,
                          color: categoryInfo.color,
                          borderLeft: `5px solid ${categoryInfo.color}`,
                        }}
                      >
                        <span className="category-icon">
                          {categoryInfo.icon}
                        </span>
                        <span className="category-name">
                          {categoryInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="feedback-header-right">
                      {deletingId === feedback.id ? (
                        <div className="delete-confirm">
                          <span className="confirm-text">Delete?</span>
                          <button
                            className="confirm-yes"
                            onClick={() => handleDelete(feedback.id)}
                            disabled={isDeleting}
                          >
                            ✓
                          </button>
                          <button
                            className="confirm-no"
                            onClick={() => setDeletingId(null)}
                            disabled={isDeleting}
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => setDeletingId(feedback.id)}
                          disabled={isDeleting}
                        >
                          <span className="delete-icon">🗑️</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="feedback-message">
                    <p>
                      "
                      {feedback.feedbacktext ||
                        feedback.message ||
                        feedback.text ||
                        "No message provided"}
                      "
                    </p>
                  </div>

                  <div className="feedback-footer">
                    <div className="feedback-rating">
                      <span className="rating-label">Rating:</span>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${
                              star <= (feedback.rating || 0) ? "filled" : ""
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-value">
                        ({feedback.rating || 0}/5)
                      </span>
                    </div>
                    <div className="feedback-email">
                      <span className="email-icon">📧</span>
                      <span className="email-text">
                        {feedback.email || "Anonymous"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading feedback...</p>
            </div>
          )}
        </div>

        {/* Show More Button */}
        {hasMore && !isLoading && displayedFeedbacks.length > 0 && (
          <div className="show-more-container">
            <button
              className="show-more-btn"
              onClick={handleShowMore}
              disabled={isLoading}
            >
              <span className="btn-icon">➕</span>
              Show More Feedback
            </button>
            <p className="items-count">
              Showing {displayedFeedbacks.length} of {totalCount} items
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
