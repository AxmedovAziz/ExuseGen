import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.scss";

const Feedback = () => {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { id: "suggestion", label: "💡 Suggestion", icon: "💡" },
    { id: "bug", label: "🐛 Bug Report", icon: "🐛" },
    { id: "improvement", label: "🚀 Improvement", icon: "🚀" },
    { id: "feature", label: "✨ New Feature", icon: "✨" },
    { id: "other", label: "📝 Other", icon: "📝" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send to your API
    console.log({
      type: feedbackType,
      rating,
      feedback: feedbackText,
      email: email || "Anonymous",
    });
    setSubmitted(true);
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
            <h1 className="feedback-title">Thank You!</h1>
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
            ></textarea>
            <div className="char-counter">{feedbackText.length}/500</div>
          </div>

          {/* Email (optional) */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📧</span>
              Email (optional)
            </label>
            <input
              type="email"
              className="feedback-input"
              placeholder="So we can follow up with you"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <span className="btn-icon">📨</span>
              Submit Feedback
            </button>
          </div>
        </form>

        <div className="feedback-footer">
          <p className="footer-note">
            Your feedback is anonymous unless you provide your email
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
