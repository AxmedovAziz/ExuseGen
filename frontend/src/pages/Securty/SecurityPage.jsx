// SecurityPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityPage.scss";

const SecurityPage = () => {
  const navigate = useNavigate();
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const securityFeatures = [
    {
      icon: "🔒",
      title: "256‑Bit AES Encryption",
      desc: "Military‑grade encryption for all data at rest and in transit.",
    },
    {
      icon: "🛡️",
      title: "Zero‑Trust Architecture",
      desc: "Every request is verified, no implicit trust.",
    },
    {
      icon: "⚡",
      title: "Real‑time Threat Detection",
      desc: "AI‑powered intrusion prevention & anomaly detection.",
    },
    {
      icon: "🧠",
      title: "Crazy Dev Security",
      desc: "Our lead dev wrote custom firewalls in Rust. Yes, really.",
    },
    {
      icon: "🔐",
      title: "Multi‑Factor Authentication",
      desc: "Mandatory MFA for all admin actions.",
    },
    {
      icon: "📡",
      title: "Quantum‑Resistant Crypto",
      desc: "Future‑proofing against quantum attacks.",
    },
  ];

  return (
    <div className="security-page">
      <div className="security-background">
        <div className="gradient-orb"></div>
        <div className="gradient-orb second"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="security-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span> Back to Safety
        </button>

        <div className="security-card">
          <div className="security-header">
            <div className="shield-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L3 7L12 12L21 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22L3 17L12 12L21 17L12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 7L12 12L21 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="security-title">
              <span className="glow-text">Ultra‑Secure</span> Environment
            </h1>
            <p className="security-subtitle">
              Your data is protected by our paranoid‑level security stack.
            </p>
          </div>

          <div className="security-badge">
            <div className="badge-content">
              <span className="badge-icon">✅</span>
              <span className="badge-text">
                SOC 2 Type II | ISO 27001 | GDPR Compliant
              </span>
            </div>
          </div>

          <div className="security-features">
            {securityFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="security-message">
            <div
              className="message-glow"
              style={{ opacity: 0.3 + (glowIntensity / 100) * 0.3 }}
            ></div>
            <div className="message-content">
              <span className="quote">“</span>
              <p>
                Our backend is built by a{" "}
                <strong>crazy genius developer</strong> who sleeps with a
                firewall under his pillow.
                <br />
                We’ve implemented{" "}
                <strong>
                  zero backdoors, immutable audit logs, and encrypted backups
                </strong>{" "}
                that even we cannot modify.
                <br />
                Your data is not going to be changed – <strong>ever</strong> –
                unless you explicitly request it through verified channels.
              </p>
              <span className="quote end">”</span>
            </div>
            <div className="signature">
              — The Security Team &nbsp;{" "}
              <span className="dev-signature">(just myself)</span>
            </div>
          </div>

          <div className="security-footer">
            <div className="security-stats">
              <div className="stat">
                <span className="stat-value">100%</span>
                <span className="stat-label">Uptime SLA</span>
              </div>
              <div className="stat">
                <span className="stat-value">256‑bit</span>
                <span className="stat-label">Encryption</span>
              </div>
              <div className="stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
            <button className="cta-button" onClick={() => navigate("/")}>
              <span>🏠</span> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
