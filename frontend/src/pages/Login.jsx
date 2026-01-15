import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setAccessToken, setRefreshToken, setUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Use simple login endpoint
        const response = await axios.post("/auth/simple/login/", {
          username,
          password,
        });

        const { access, refresh, user: userData } = response.data;

        // Save tokens and user data
        setAccessToken(access);
        setRefreshToken(refresh);
        setUser(userData);

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user", JSON.stringify(userData));

        navigate("/profile");
      } else {
        // Registration
        const response = await axios.post("/auth/registration/", {
          username,
          email,
          password1: password,
          password2: password,
        });

        alert("Registration successful! Please login.");
        setIsLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Auth error:", err.response?.data);
      if (isLogin) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.non_field_errors?.[0] ||
            "Invalid credentials"
        );
      } else {
        setError(
          Object.values(err.response?.data || {}).flat()[0] ||
            "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8000/accounts/google/login/?process=login";
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Login with Google
      </button>

      <p style={{ textAlign: "center" }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default Login;
