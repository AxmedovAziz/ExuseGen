import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.scss";

const Feedback = ({ user }) => {
  // Add user prop here
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: "suggestion",
      label: "💡 Suggestion",
      icon: "💡",
      apiValue: "Suggestion",
    },
    { id: "bug", label: "🐛 Bug Report", icon: "🐛", apiValue: "Bug" },
    {
      id: "improvement",
      label: "🚀 Improvement",
      icon: "🚀",
      apiValue: "Improvement",
    },
    { id: "feature", label: "✨ New Feature", icon: "✨", apiValue: "Feature" },
    { id: "other", label: "📝 Other", icon: "📝", apiValue: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user exists and has email
    if (!user?.email) {
      setError("User email not found. Please log in again.");
      return;
    }

    // Validation
    if (!feedbackText.trim()) {
      setError("Please enter your feedback");
      return;
    }

    if (rating === 0) {
      setError("Please rate your experience");
      return;
    }

    setIsLoading(true);
    setError("");

    // Find the selected feedback type's API value
    const selectedType = feedbackTypes.find((type) => type.id === feedbackType);

    // Prepare data for API with user's actual email from props
    const feedbackData = {
      feedbacktype: selectedType?.apiValue || "Other",
      feedbacktext: feedbackText,
      rating: rating,
      email: user.email, // Using the email from user prop
    };

    console.log("Submitting feedback with email:", user.email);
    console.log("Feedback data:", feedbackData);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/excuses/feedback/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        }
      );

      console.log("Status Code:", response.status);

      const responseText = await response.text();
      console.log("Response Text:", responseText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      try {
        const jsonResponse = JSON.parse(responseText);
        console.log("JSON:", jsonResponse);
      } catch (e) {
        console.log("Response is not JSON");
      }

      // Show success message
      setSubmitted(true);
    } catch (err) {
      setError(`Failed to submit feedback: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span> Back
          </button>

          <div className="feedback-header">
            <div className="feedback-icon">🎉</div>
            <h1 className="feedback-title">
              Thank You, {user?.username || "User"}!
            </h1>
            <p className="feedback-subtitle">
              Your feedback helps make this app better
            </p>
          </div>

          <div className="success-content">
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark">✓</div>
              </div>
            </div>

            <p className="success-message">
              We appreciate you taking the time to share your thoughts.
            </p>
            <p className="success-email">
              A confirmation will be sent to: <strong>{user?.email}</strong>
            </p>

            <button className="done-btn" onClick={() => navigate(-1)}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span> Back
        </button>

        <div className="feedback-header">
          <div className="feedback-icon">💬</div>
          <h1 className="feedback-title">Share Your Feedback</h1>
          <p className="feedback-subtitle">Help us improve your experience</p>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          {/* Feedback Type */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📋</span>
              What would you like to share?
            </label>
            <div className="feedback-type-grid">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`type-btn ${
                    feedbackType === type.id ? "active" : ""
                  }`}
                  onClick={() => setFeedbackType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Section */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">⭐</span>
              Rate your experience
            </label>
            <div className="rating-container">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      (hoverRating || rating) >= star ? "active" : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="rating-label">
                {rating === 0 && "Tap to rate"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent!"}
              </span>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">💭</span>
              Your feedback
            </label>
            <textarea
              className="feedback-textarea"
              rows="5"
              placeholder="Tell us what you like, what could be improved, or any issues you've encountered..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
              maxLength="500"
            ></textarea>
            <div className="char-counter">{feedbackText.length}/500</div>
          </div>

          {/* User Info Display - Shows who is submitting */}
          <div className="user-info-section">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.username || "User"}</span>
                <span className="user-email">{user?.email || "No email"}</span>
              </div>
              <div className="user-badge">
                <span className="badge-icon">✓</span>
                Authenticated
              </div>
            </div>
            <p className="user-info-note">
              Feedback will be sent from your account email
            </p>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className={`submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              <span className="btn-icon">{isLoading ? "⏳" : "📨"}</span>
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
          <div className="view-feedback-link">
            <button
              type="button"
              className="view-feedback-btn"
              onClick={() => navigate("/feedback-list")}
            >
              <span className="btn-icon">👀</span>
              View All Feedback
            </button>
            <p className="view-feedback-note">See what others are saying</p>
          </div>
        </form>

        <div className="feedback-footer">
          <p className="footer-note">
            Submitting as: <strong>{user?.email || "Unknown"}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
