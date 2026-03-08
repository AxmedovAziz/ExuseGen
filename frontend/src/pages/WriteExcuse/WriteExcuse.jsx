import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WriteExcuse.scss";

const WriteExcuse = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [excuseText, setExcuseText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    emoji: "📌",
  });

  // Default categories
  const defaultCategories = [
    { id: "work", name: "Work", icon: "💼" },
    { id: "school", name: "School", icon: "📚" },
    { id: "social", name: "Social", icon: "🎉" },
    { id: "family", name: "Family", icon: "👨‍👩‍👧" },
    { id: "health", name: "Health", icon: "❤️" },
    { id: "traffic", name: "Traffic", icon: "🚗" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "pets", name: "Pets", icon: "🐕" },
  ];

  // Common emojis for selection
  const commonEmojis = [
    "📌",
    "⭐",
    "🔥",
    "✨",
    "🎯",
    "💡",
    "🎨",
    "🎭",
    "⚽",
    "🏀",
    "🎮",
    "📱",
    "☕",
    "🍕",
    "🌮",
    "🎵",
    "🎬",
    "📷",
    "✈️",
    "🏠",
    "🌍",
    "💰",
    "🎁",
    "🔔",
    "💪",
    "🧠",
    "👀",
    "🗣️",
    "🤔",
    "😅",
    "🐶",
    "🐱",
    "🐼",
    "🦊",
    "🐸",
    "🐧",
    "🦄",
    "🐙",
    "🦋",
    "🌵",
    "🌸",
    "🌈",
    "⚡",
    "❄️",
    "☀️",
    "🌙",
    "⏰",
    "📚",
    "✏️",
    "🎒",
  ];

  // Combine default and custom categories
  const allCategories = [...defaultCategories, ...customCategories];

  const handleAddCategory = () => {
    // Validation
    if (newCategory.name.trim().length < 3) {
      alert("Category name must be at least 3 characters");
      return;
    }
    if (newCategory.name.length > 20) {
      alert("Category name must be less than 20 characters");
      return;
    }

    // Create new category
    const newCat = {
      id: `custom-${Date.now()}`,
      name: newCategory.name.trim(),
      icon: newCategory.emoji,
      isCustom: true,
    };

    setCustomCategories([...customCategories, newCat]);
    setNewCategory({ name: "", emoji: "📌" });
    setShowPopup(false);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("Delete this category?")) {
      setCustomCategories(
        customCategories.filter((cat) => cat.id !== categoryId)
      );
      // If deleted category was selected, clear selection
      const deletedCat = customCategories.find((cat) => cat.id === categoryId);
      if (deletedCat && category === deletedCat.name) {
        setCategory("");
      }
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
          {/* Category Section */}
          <div className="category-section">
            <label className="form-label">
              <span className="label-icon">📋</span>
              Choose Category
            </label>
            <div className="category-buttons">
              {/* Default Categories */}
              {defaultCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${
                    category === cat.name ? "active" : ""
                  }`}
                  onClick={() => setCategory(cat.name)}
                  type="button"
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}

              {/* Custom Categories */}
              {customCategories.map((cat) => (
                <div key={cat.id} className="category-btn-wrapper">
                  <button
                    className={`category-btn custom ${
                      category === cat.name ? "active" : ""
                    }`}
                    onClick={() => setCategory(cat.name)}
                    type="button"
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                  </button>
                  <button
                    className="delete-category-btn"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add Category Button */}
              <button
                className="category-btn add-category-btn"
                onClick={() => setShowPopup(true)}
                type="button"
              >
                <span className="category-icon">➕</span>
                <span className="category-name">Add Category</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📂</span>
              Or Select from Dropdown
            </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Choose a category</option>
              {allCategories.map((cat, index) => (
                <option key={index} value={cat.name}>
                  {cat.icon} {cat.name} {cat.isCustom ? "(Custom)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">💭</span>
              Your Excuse
            </label>
            <textarea
              className="form-textarea"
              rows="5"
              placeholder="Type your excuse here..."
              value={excuseText}
              onChange={(e) => setExcuseText(e.target.value)}
            ></textarea>
          </div>

          <div className="form-actions">
            <button className="generate-btn" disabled>
              <span className="btn-icon">⚡</span>
              Generate (Coming Soon)
            </button>
            <button className="save-btn" disabled>
              <span className="btn-icon">💾</span>
              Save
            </button>
          </div>
        </div>

        <div className="write-preview">
          <h3 className="preview-title">Preview</h3>
          <div className="preview-box">
            {excuseText ? (
              <p className="preview-text">"{excuseText}"</p>
            ) : (
              <p className="preview-placeholder">
                Your excuse will appear here...
              </p>
            )}
            {category && <span className="preview-category">#{category}</span>}
          </div>
        </div>

        <div className="write-footer">
          <p className="placeholder-note">
            Full excuse generator will be added here • API integration coming
            soon
          </p>
        </div>
      </div>

      {/* Add Category Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              ✕
            </button>

            <h2 className="popup-title">Create New Category</h2>

            <div className="popup-form-group">
              <label className="popup-label">
                <span className="label-icon">📝</span>
                Category Name (3-20 characters)
              </label>
              <input
                type="text"
                className="popup-input"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Gaming, Dating, Sports"
                maxLength="20"
                autoFocus
              />
              <div className="char-counter">{newCategory.name.length}/20</div>
            </div>

            <div className="popup-form-group">
              <label className="popup-label">
                <span className="label-icon">😊</span>
                Choose an Emoji
              </label>
              <div className="emoji-grid">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className={`emoji-btn ${
                      newCategory.emoji === emoji ? "active" : ""
                    }`}
                    onClick={() => setNewCategory({ ...newCategory, emoji })}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="popup-preview">
              <span className="preview-label">Preview:</span>
              <div className="preview-category-tag">
                <span className="tag-emoji">{newCategory.emoji}</span>
                <span className="tag-name">
                  {newCategory.name || "Category Name"}
                </span>
              </div>
            </div>

            <div className="popup-actions">
              <button
                className="popup-cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button className="popup-save-btn" onClick={handleAddCategory}>
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriteExcuse;
