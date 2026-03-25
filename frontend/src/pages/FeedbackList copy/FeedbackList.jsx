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

  // Fetch feedbacks from API with filtering
  const fetchFeedbacks = async (page = 1, category = "all") => {
    setIsLoading(true);
    setError("");

    try {
      // Build URL with query parameters
      let url = `http://127.0.0.1:8000/api/excuses/feedback/?page=${page}&page_size=${ITEMS_PER_PAGE}`;

      // Add category filter if not "all"
      if (category !== "all") {
        url += `&feedbacktype=${category}`;
      }

      console.log("Fetching URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Handle different API response structures
      let newFeedbacks = [];
      let total = 0;

      if (data.results) {
        // If API returns paginated results
        newFeedbacks = data.results;
        total = data.count || data.results.length;
      } else if (Array.isArray(data)) {
        // If API returns array directly
        newFeedbacks = data;
        total = data.length;
      } else {
        // If API returns object with data property
        newFeedbacks = data.data || [];
        total = data.total || newFeedbacks.length;
      }

      // Client-side filtering in case API doesn't filter properly
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

      // Check if there are more items to load
      setHasMore(newFeedbacks.length === ITEMS_PER_PAGE);
      setTotalCount(total);
    } catch (err) {
      setError(`Failed to load feedback: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks(1, "all");
  }, []);

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setFeedbacks([]);
    setDisplayedFeedbacks([]);

    // Get the API value for the selected category
    const selectedCat = categories.find((c) => c.id === categoryId);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(1, apiCategory);
  };

  // Handle show more
  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // Get the API value for the selected category
    const selectedCat = categories.find((c) => c.id === selectedCategory);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(nextPage, apiCategory);
  };

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
                  <div className="feedback-item-header">
                    <div
                      className="feedback-category"
                      style={{
                        backgroundColor: `${categoryInfo.color}20`,
                        color: categoryInfo.color,
                        borderLeft: `5px solid ${categoryInfo.color}`,
                      }}
                    >
                      <span className="category-icon">{categoryInfo.icon}</span>
                      <span className="category-name">
                        {categoryInfo.label}
                      </span>
                    </div>
                    <div className="feedback-date">
                      <span className="date-icon">🕒</span>
                      {formatDate(
                        feedback.created_at ||
                          feedback.date ||
                          feedback.timestamp
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
