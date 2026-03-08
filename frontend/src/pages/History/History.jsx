import React from "react";
import { useNavigate } from "react-router-dom";
import "./History.scss";

const History = () => {
  const navigate = useNavigate();

  return (
    <div className="history-container">
      <div className="history-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span> Back
        </button>

        <div className="history-header">
          <div className="history-icon">📜</div>
          <h1 className="history-title">Excuse History</h1>
          <p className="history-subtitle">Your previously generated excuses</p>
        </div>

        <div className="history-content">
          {/* Placeholder items - will be replaced with API data */}
          <div className="history-item">
            <div className="item-icon">⏰</div>
            <div className="item-details">
              <p className="item-excuse">
                "My dog ate my homework... and then my laptop"
              </p>
              <span className="item-date">March 2, 2026</span>
            </div>
          </div>

          <div className="history-item">
            <div className="item-icon">🚗</div>
            <div className="item-details">
              <p className="item-excuse">
                "Traffic was absolutely insane today"
              </p>
              <span className="item-date">March 1, 2026</span>
            </div>
          </div>

          <div className="history-item">
            <div className="item-icon">💻</div>
            <div className="item-details">
              <p className="item-excuse">
                "Zoom crashed right when I was about to speak"
              </p>
              <span className="item-date">February 28, 2026</span>
            </div>
          </div>

          <div className="history-item">
            <div className="item-icon">😴</div>
            <div className="item-details">
              <p className="item-excuse">
                "My alarm never went off this morning"
              </p>
              <span className="item-date">February 27, 2026</span>
            </div>
          </div>

          <div className="history-item">
            <div className="item-icon">📱</div>
            <div className="item-details">
              <p className="item-excuse">
                "My phone died and I lost your number"
              </p>
              <span className="item-date">February 26, 2026</span>
            </div>
          </div>
        </div>

        <div className="history-footer">
          <p className="placeholder-note">
            API integration coming soon • History will be saved here
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;
