import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import axios from "axios";

// Configure axios globally
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

function App() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (
          accessToken &&
          !config.url.includes("/auth/jwt/create/") &&
          !config.url.includes("/auth/simple/login/")
        ) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we have a refresh token
        if (
          error.response?.status === 401 &&
          refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const response = await axios.post("/auth/jwt/refresh/", {
              refresh: refreshToken,
            });

            const newAccessToken = response.data.access;
            setAccessToken(newAccessToken);
            localStorage.setItem("access_token", newAccessToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Check if user is already authenticated
    const checkAuth = async () => {
      if (accessToken) {
        try {
          // Verify the token
          await axios.post("/auth/jwt/verify/", { token: accessToken });

          // Get user data
          const response = await axios.get("/auth/user/");
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]);

  const handleLogout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  if (isLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/profile" />
              ) : (
                <Login
                  setAccessToken={setAccessToken}
                  setRefreshToken={setRefreshToken}
                  setUser={setUser}
                />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
