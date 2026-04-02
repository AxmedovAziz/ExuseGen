import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FeedbackList.scss";
import useAdminCheck from "../../../hooks/useAdminCheck";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const { isAdmin, authLoading } = useAdminCheck({ redirectIfNotAdmin: true });

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const ITEMS_PER_PAGE = 10;

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
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
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

  const getFeedbackText = (feedback) => {
    return (
      feedback.feedbacktext ||
      feedback.message ||
      feedback.text ||
      "No message provided"
    );
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks(1, "all");
    }
  }, [isAdmin]);

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

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

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
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort feedbacks
  useEffect(() => {
    let result = [...feedbacks];

    // Category filter
    if (selectedCategory !== "all") {
      const selectedCat = categories.find((c) => c.id === selectedCategory);
      result = result.filter((f) => {
        const category = f.feedbacktype || f.category || "";
        return category.toLowerCase() === selectedCat?.apiValue.toLowerCase();
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          getFeedbackText(f).toLowerCase().includes(term) ||
          (f.email && f.email.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "message":
          aValue = getFeedbackText(a);
          bValue = getFeedbackText(b);
          break;
        case "category":
          aValue = (a.feedbacktype || a.category || "").toLowerCase();
          bValue = (b.feedbacktype || b.category || "").toLowerCase();
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "date":
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setDisplayedFeedbacks(result);
  }, [feedbacks, selectedCategory, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

      const updatedFeedbacks = feedbacks.filter((f) => f.id !== id);
      setFeedbacks(updatedFeedbacks);
      setTotalCount((prev) => prev - 1);
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));

      setSuccessMessage("Feedback deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to delete feedback: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedRows.length} feedback items?`
    );
    if (!confirmed) return;

    for (const id of selectedRows) {
      await handleDelete(id);
    }
    setSelectedRows([]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === displayedFeedbacks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedFeedbacks.map((f) => f.id).filter((id) => id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setFeedbacks([]);
    setDisplayedFeedbacks([]);
    setSelectedRows([]);
    setSearchTerm("");

    const selectedCat = categories.find((c) => c.id === categoryId);
    const apiCategory = selectedCat?.apiValue || "all";
    fetchFeedbacks(1, apiCategory);
  };

  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    const selectedCat = categories.find((c) => c.id === selectedCategory);
    const apiCategory = selectedCat?.apiValue || "all";
    fetchFeedbacks(nextPage, apiCategory);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    handleCategoryFilter("all");
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="sort-icon">↕️</span>;
    return (
      <span className="sort-icon">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="forbidden-page">
        <div className="forbidden-card">
          <div className="forbidden-icon">🚫</div>
          <h1>403 - Access Denied</h1>
          <p>You don't have permission to view this page.</p>
          <button onClick={() => navigate("/")} className="back-home-btn">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-card">
        {/* Header */}
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

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-chip ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryFilter(category.id)}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : "transparent",
                }}
              >
                <span className="filter-icon">{category.icon}</span>
                <span className="filter-label">{category.label}</span>
              </button>
            ))}
          </div>

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by message or email..."
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

        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">
              {selectedRows.length} items selected
            </span>
            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
              🗑️ Delete Selected
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

        {/* Table View */}
        {displayedFeedbacks.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No feedback found</h3>
            <p>
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your filters or search term"
                : "Be the first to share your thoughts!"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button className="clear-all-filters" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === displayedFeedbacks.length &&
                          displayedFeedbacks.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("message")}
                    >
                      Message <SortIcon column="message" />
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("category")}
                    >
                      Category <SortIcon column="category" />
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("rating")}
                    >
                      Rating <SortIcon column="rating" />
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("email")}
                    >
                      Email <SortIcon column="email" />
                    </th>
                    <th className="sortable" onClick={() => handleSort("date")}>
                      Date <SortIcon column="date" />
                    </th>
                    <th className="actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFeedbacks.map((feedback) => {
                    const categoryInfo = getCategoryInfo(
                      feedback.feedbacktype || feedback.category
                    );
                    const feedbackText = getFeedbackText(feedback);

                    return (
                      <tr
                        key={feedback.id}
                        className={
                          selectedRows.includes(feedback.id) ? "selected" : ""
                        }
                      >
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(feedback.id)}
                            onChange={() => handleSelectRow(feedback.id)}
                          />
                        </td>
                        <td className="message-cell" title={feedbackText}>
                          {feedbackText.length > 60
                            ? `${feedbackText.substring(0, 60)}...`
                            : feedbackText}
                        </td>
                        <td className="category-cell">
                          <span
                            className="category-badge"
                            style={{
                              backgroundColor: `${categoryInfo.color}15`,
                              color: categoryInfo.color,
                            }}
                          >
                            <span className="badge-icon">
                              {categoryInfo.icon}
                            </span>
                            <span>{categoryInfo.label}</span>
                          </span>
                        </td>
                        <td className="rating-cell">
                          <div className="rating-stars-mini">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star-mini ${
                                  star <= (feedback.rating || 0) ? "filled" : ""
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="rating-number">
                              ({feedback.rating || 0})
                            </span>
                          </div>
                        </td>
                        <td className="email-cell">
                          <span className="email-value">
                            {feedback.email || "Anonymous"}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(feedback.created_at)}
                        </td>
                        <td className="actions-cell">
                          {deletingId === feedback.id ? (
                            <div className="inline-delete-confirm">
                              <button
                                className="confirm-delete"
                                onClick={() => handleDelete(feedback.id)}
                                disabled={isDeleting}
                              >
                                ✓
                              </button>
                              <button
                                className="cancel-delete"
                                onClick={() => setDeletingId(null)}
                                disabled={isDeleting}
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <button
                              className="delete-row-btn"
                              onClick={() => setDeletingId(feedback.id)}
                              disabled={isDeleting}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Loading More */}
            {isLoading && (
              <div className="loading-more">
                <div className="spinner-small"></div>
                <p>Loading more feedback...</p>
              </div>
            )}

            {/* Show More Button */}
            {hasMore && !isLoading && displayedFeedbacks.length > 0 && (
              <div className="show-more-container">
                <button className="show-more-btn" onClick={handleShowMore}>
                  <span className="btn-icon">➕</span>
                  Show More
                </button>
                <p className="items-count">
                  Showing {displayedFeedbacks.length} of {totalCount} items
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
