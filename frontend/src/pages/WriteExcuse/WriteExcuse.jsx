import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WriteExcuse.scss";
import useLastEmail from "../../hooks/useLastEmail";
const WriteExcuse = () => {
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    reason: "family emergency",
    category: "",
    target: "school",
    author_role: "parent",
    student_name: "",
    date: getTodayDate(),
    tone: "formal",
  });
  const [emailTo, setEmailTo] = useState("");
  const [generatedExcuses, setGeneratedExcuses] = useState([]);
  const [selectedExcuse, setSelectedExcuse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const { lastEmail, loading } = useLastEmail();
  const [newCategory, setNewCategory] = useState({
    name: "",
    emoji: "📌",
  });

  useEffect(() => {
    if (lastEmail?.to) {
      setEmailTo(lastEmail.to);
    }
    if (lastEmail?.subject) {
      setFormData((prev) => ({
        ...prev,
        student_name: lastEmail.subject.replace("Excuse Note - ", "").trim(),
      }));
    }
  }, [lastEmail]);
  // Category options - only these three
  const categoryOptions = [
    { id: "absent", name: "Absent", icon: "🚫", value: "absent" },
    { id: "late", name: "Late Arrival", icon: "⏰", value: "late_arrival" },
    { id: "early", name: "Leave Early", icon: "🚪", value: "leave_early" },
  ];

  // Author role options
  const authorRoles = [
    { id: "parent", name: "Parent", value: "parent" },
    { id: "me", name: "Me (Student)", value: "student" },
    { id: "guardian", name: "Guardian", value: "guardian" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (categoryValue) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryValue,
    }));
  };

  const handleExcuseSelect = (excuseText) => {
    setSelectedExcuse(excuseText);
  };

  const generateExcuse = async () => {
    // Optional validation - only check if user wants to validate
    if (!formData.student_name.trim()) {
      setError("Please enter a student name");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedExcuses([]);
    setSelectedExcuse("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/excuses/generate/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: formData.reason || "family emergency",
            reason_category: formData.category || "absent",
            target: formData.target || "school",
            author_role: formData.author_role || "parent",
            student_name: formData.student_name,
            date: formData.date || getTodayDate(),
            tone: formData.tone || "formal",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse the excuses string into an array
      if (data.excuses) {
        setGeneratedExcuses(data.excuses);
      }
    } catch (err) {
      setError(`Failed to generate excuse: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // For future implementation
  const handleSend = async () => {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token); // ← check this in browser console
    console.log("EMAIL TO:", emailTo);
    console.log("EXCUSE:", selectedExcuse);
    if (!emailTo) {
      setError("Please enter an email address to send to");
      return;
    }
    if (!selectedExcuse) {
      setError("Please select an excuse first");
      return;
    }

    setIsSending(true);
    setError("");
    setSendSuccess(false);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You need to log in first");
      }

      // Fix: use correct endpoint and field names
      const response = await fetch("http://127.0.0.1:8000/auth/send-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emailTo, // was "to"
          subject: `Excuse Note - ${formData.student_name}`,
          body: selectedExcuse, // was "body"
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        // Special handling for missing Gmail permissions
        if (response.status === 403 && errData.auth_url) {
          // Redirect user to Google OAuth consent screen
          window.location.href = errData.auth_url;
          return;
        }
        throw new Error(errData.error || "Failed to send email");
      }

      setSendSuccess(true);
      setEmailTo(""); // optional: clear the email input after success
    } catch (err) {
      setError(`Failed to send: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="write-container">
      <div className="write-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span> Back
        </button>

        <div className="write-header">
          <div className="write-icon">✍️</div>
          <h1 className="write-title">Write Excuse</h1>
          <p className="write-subtitle">Create your perfect excuse</p>
        </div>

        <div className="write-form">
          {/* Category Section - Only 3 options */}
          <div className="category-section">
            <label className="form-label">
              <span className="label-icon">📋</span>
              Excuse Type
            </label>
            <div className="category-buttons category-buttons-three">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${
                    formData.category === cat.value ? "active" : ""
                  }`}
                  onClick={() => handleCategorySelect(cat.value)}
                  type="button"
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input - Default "family emergency" */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">💭</span>
              Reason
            </label>
            <textarea
              className="form-textarea"
              name="reason"
              rows="2"
              placeholder="Reason for absence..."
              value={formData.reason}
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* Student Name */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👤</span>
              Student Name
            </label>
            <input
              type="text"
              className="form-input"
              name="student_name"
              placeholder="e.g., Michael Johnson"
              value={formData.student_name}
              onChange={handleInputChange}
            />
          </div>

          {/* Date Picker - Professional calendar */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Date
            </label>
            <div className="date-input-wrapper">
              <input
                type="date"
                className="form-date-input"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getTodayDate()}
              />
              <span className="date-icon">📆</span>
            </div>
          </div>

          {/* Target and Author Role */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Target
              </label>
              <select
                className="form-select"
                name="target"
                value={formData.target}
                onChange={handleInputChange}
              >
                <option value="school">School</option>
                <option value="work">Work</option>
                <option value="college">College</option>
                <option value="university">University</option>
              </select>
            </div>

            <div className="form-group half">
              <label className="form-label">
                <span className="label-icon">👥</span>
                Author Role
              </label>
              <select
                className="form-select"
                name="author_role"
                value={formData.author_role}
                onChange={handleInputChange}
              >
                {authorRoles.map((role) => (
                  <option key={role.id} value={role.value}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone Selection */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎭</span>
              Tone
            </label>
            <div className="tone-buttons">
              {["formal", "casual", "urgent", "apologetic"].map((tone) => (
                <button
                  key={tone}
                  className={`tone-btn ${
                    formData.tone === tone ? "active" : ""
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, tone }))}
                  type="button"
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              className="generate-btn"
              onClick={generateExcuse}
              disabled={isLoading}
            >
              <span className="btn-icon">{isLoading ? "⏳" : "⚡"}</span>
              {isLoading ? "Generating..." : "Generate Excuses"}
            </button>
          </div>
        </div>

        {/* Generated Excuses List */}
        {generatedExcuses.length > 0 && (
          <div className="excuses-section">
            <h3 className="preview-title">Choose an Excuse</h3>
            <div className="excuses-list">
              {generatedExcuses.map((excuse, index) => (
                <button
                  key={index}
                  className={`excuse-card ${
                    selectedExcuse === excuse ? "selected" : ""
                  }`}
                  onClick={() => handleExcuseSelect(excuse)}
                >
                  <div className="excuse-number">{index + 1}</div>
                  <p className="excuse-text">{excuse}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Excuse Editor */}
        {selectedExcuse && (
          <div className="selected-excuse-section">
            <h3 className="preview-title">Edit Your Excuse</h3>
            <textarea
              className="form-textarea excuse-editor"
              rows="6"
              value={selectedExcuse}
              onChange={(e) => setSelectedExcuse(e.target.value)}
            ></textarea>
            {/* NEW EMAIL SECTION - ADD THIS EXACT BLOCK */}
            <div className="email-section">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Send To (Email)
              </label>
              <div className="email-input-wrapper">
                <input
                  type="email"
                  className="form-email-input"
                  placeholder="e.g., office@school.com"
                  value={emailTo}
                  onChange={(e) => {
                    setEmailTo(e.target.value);
                    setSendSuccess(false);
                  }}
                />
                <span className="email-icon">✉️</span>
              </div>
              <p className="email-note">
                Email will be sent from your linked Gmail account
              </p>
            </div>
            {/* Send Button (Future Implementation) */}
            {sendSuccess && (
              <div className="success-message">
                ✅ Excuse sent successfully to {emailTo}!
              </div>
            )}

            {/* SEND BUTTON */}
            <div className="send-button-container">
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={isSending || !emailTo}
              >
                <span className="btn-icon">{isSending ? "⏳" : "📤"}</span>
                {isSending ? "Sending..." : "Send Excuse"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-section">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Generating 5 perfect excuses...</p>
            </div>
          </div>
        )}

        <div className="write-footer">
          <p className="placeholder-note">
            ✨ AI generates 5 different excuses • Click any to edit
          </p>
        </div>
      </div>
    </div>
  );
};

export default WriteExcuse;
