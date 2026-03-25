import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./FeedbackList.scss";

const FeedbackList = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  const ITEMS_PER_PAGE = 5;

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

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // Function to build URL with proper parameters
  const buildUrl = (page, category) => {
    const baseUrl = "http://127.0.0.1:8000/api/excuses/feedback/";
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("page_size", ITEMS_PER_PAGE);

    if (category !== "all") {
      params.append("feedbacktype", category);
      params.append("category", category);
      params.append("type", category);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchFeedbacks = async (
    page = 1,
    category = "all",
    isLoadMore = false
  ) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setFeedbacks([]);
      setError("");
      setHasMore(true);
    }

    try {
      const url = buildUrl(page, category);
      console.log("Fetching:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let newFeedbacks = [];
      let total = 0;
      let nextPageUrl = null;

      if (data.results) {
        newFeedbacks = data.results;
        total = data.count || 0;
        nextPageUrl = data.next;
      } else if (Array.isArray(data)) {
        newFeedbacks = data;
        total = data.length;
        nextPageUrl = null;
      } else if (data.data && Array.isArray(data.data)) {
        newFeedbacks = data.data;
        total = data.total || data.data.length;
        nextPageUrl = data.next_page;
      } else {
        newFeedbacks = Array.isArray(data) ? data : [];
        total = newFeedbacks.length;
      }

      if (category !== "all" && newFeedbacks.length > 0) {
        const filteredFeedbacks = newFeedbacks.filter((feedback) => {
          const feedbackCategory = (
            feedback.feedbacktype ||
            feedback.category ||
            feedback.type ||
            ""
          ).toLowerCase();
          return feedbackCategory === category.toLowerCase();
        });

        if (filteredFeedbacks.length > 0) {
          newFeedbacks = filteredFeedbacks;
          total = filteredFeedbacks.length;
        }
      }

      if (isLoadMore) {
        setFeedbacks((prev) => [...prev, ...newFeedbacks]);
      } else {
        setFeedbacks(newFeedbacks);
      }

      let hasMoreItems = false;

      if (nextPageUrl) {
        hasMoreItems = true;
      } else if (newFeedbacks.length === ITEMS_PER_PAGE) {
        hasMoreItems = true;
      } else {
        hasMoreItems = false;
      }

      setHasMore(hasMoreItems);
      setTotalCount(total);
      setCurrentPage(page);

      console.log(
        `Page ${page}: Loaded ${newFeedbacks.length} items, hasMore: ${hasMoreItems}`
      );
    } catch (err) {
      setError(`Failed to load feedback: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFeedbacks(1, selectedCategory, false);
  }, []);

  const handleCategoryFilter = (categoryId) => {
    console.log("Filtering by:", categoryId);
    setSelectedCategory(categoryId);
    setCurrentPage(1);

    const selectedCat = categories.find((c) => c.id === categoryId);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(1, apiCategory, false);
  };

  const handleShowMore = () => {
    if (!hasMore || isLoadingMore) return;

    const nextPage = currentPage + 1;
    const selectedCat = categories.find((c) => c.id === selectedCategory);
    const apiCategory = selectedCat?.apiValue || "all";

    fetchFeedbacks(nextPage, apiCategory, true);
  };

  const handleDeleteClick = (feedbackId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(feedbackId);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(null);
  };

  const handleConfirmDelete = async (feedbackId, e) => {
    e.stopPropagation();
    setDeletingId(feedbackId);
    setShowDeleteConfirm(null);

    try {
      const url = `http://127.0.0.1:8000/api/excuses/feedback/${feedbackId}/`;
      console.log("Deleting:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete Status Code:", response.status);

      if (
        response.status === 204 ||
        response.status === 200 ||
        response.status === 404
      ) {
        // Remove the deleted feedback from state
        setFeedbacks((prevFeedbacks) =>
          prevFeedbacks.filter((f) => (f.id || f._id) !== feedbackId)
        );

        // Show success message
        setDeleteSuccess(feedbackId);

        // Update total count
        setTotalCount((prev) => Math.max(0, prev - 1));

        // Hide success message after 2 seconds
        setTimeout(() => {
          setDeleteSuccess(null);
        }, 2000);
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (err) {
      setError(`Failed to delete feedback: ${err.message}`);
      console.error("Delete Error:", err);

      // Hide error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-card">
        {/* Header */}
        <div className="list-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span> Back
          </button>

          <div className="header-content">
            <div className="header-icon">📊</div>
            <div className="header-text">
              <h1>User Feedback</h1>
              <p className="header-subtitle">
                {totalCount > 0 ? (
                  <>
                    {totalCount} feedback {totalCount === 1 ? "item" : "items"}{" "}
                    • Showing {feedbacks.length}
                  </>
                ) : !isLoading ? (
                  "No feedback yet"
                ) : (
                  "Loading..."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="filters-section">
          <div className="filters-label">Filter by:</div>
          <div className="filters-scroll">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryFilter(category.id)}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : "transparent",
                  borderColor: category.color,
                  color:
                    selectedCategory === category.id ? "white" : category.color,
                }}
              >
                <span className="filter-icon">{category.icon}</span>
                <span className="filter-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Indicator */}
        {selectedCategory !== "all" && (
          <div className="active-filter-indicator">
            <span className="indicator-icon">🔍</span>
            <span>
              Showing only:{" "}
              <strong>
                {categories.find((c) => c.id === selectedCategory)?.label}
              </strong>
            </span>
            <button
              className="clear-filter-btn"
              onClick={() => handleCategoryFilter("all")}
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {deleteSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            Feedback deleted successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading feedback...</p>
          </div>
        )}

        {/* Feedback List */}
        {!isLoading && (
          <div className="feedback-items">
            {feedbacks.length === 0 ? (
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
              <>
                {feedbacks.map((feedback, index) => {
                  const categoryName =
                    feedback.feedbacktype ||
                    feedback.category ||
                    feedback.type ||
                    "Other";
                  const categoryInfo = getCategoryInfo(categoryName);
                  const feedbackId = feedback.id || feedback._id;
                  const isDeleting = deletingId === feedbackId;
                  const showConfirm = showDeleteConfirm === feedbackId;
                  const isSuccess = deleteSuccess === feedbackId;

                  return (
                    <div
                      key={feedbackId || index}
                      className={`feedback-item ${
                        isDeleting ? "deleting" : ""
                      } ${isSuccess ? "delete-success" : ""}`}
                    >
                      <div className="feedback-header">
                        <div className="feedback-category-wrapper">
                          <div
                            className="feedback-category"
                            style={{ backgroundColor: categoryInfo.color }}
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
                          <div className="feedback-date">
                            <span className="date-icon">🕒</span>
                            {formatDate(
                              feedback.created_at ||
                                feedback.date ||
                                feedback.timestamp ||
                                feedback.createdAt
                            )}
                          </div>

                          {/* Delete Button */}
                          {!showConfirm && (
                            <button
                              className="delete-btn"
                              onClick={(e) => handleDeleteClick(feedbackId, e)}
                              disabled={isDeleting}
                              title="Delete feedback"
                            >
                              {isDeleting ? (
                                <span className="delete-spinner"></span>
                              ) : (
                                <span className="delete-icon">🗑️</span>
                              )}
                            </button>
                          )}

                          {/* Delete Confirmation */}
                          {showConfirm && (
                            <div className="delete-confirm">
                              <span className="confirm-text">Delete?</span>
                              <button
                                className="confirm-yes"
                                onClick={(e) =>
                                  handleConfirmDelete(feedbackId, e)
                                }
                                disabled={isDeleting}
                              >
                                ✓
                              </button>
                              <button
                                className="confirm-no"
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="feedback-message">
                        <p>
                          {feedback.feedbacktext ||
                            feedback.message ||
                            feedback.text ||
                            feedback.content ||
                            "No message provided"}
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
                          <span
                            className="email-text"
                            title={feedback.email || "Anonymous"}
                          >
                            {feedback.email ||
                              feedback.user_email ||
                              "Anonymous"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Show More Button */}
        {!isLoading && feedbacks.length > 0 && hasMore && (
          <div className="show-more-container">
            <button
              className="show-more-btn"
              onClick={handleShowMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <span className="spinner-small"></span>
                  Loading...
                </>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  Show More ({ITEMS_PER_PAGE} more)
                </>
              )}
            </button>
            <p className="items-count">
              Showing {feedbacks.length} of {totalCount || "many"} items
            </p>
          </div>
        )}

        {/* End of list message */}
        {!isLoading && !hasMore && feedbacks.length > 0 && (
          <div className="end-of-list">
            <p>✨ You've seen all {feedbacks.length} feedback items ✨</p>
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && feedbacks.length > 0 && (
          <div className="loading-more">
            <div className="spinner-small"></div>
            <span>Loading more feedback...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
