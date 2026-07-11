import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/LoginAndRegister/Login";
import Profile from "./pages/Profile/Profile";
// import History from "./pages/History/History";
import WriteExcuse from "./pages/WriteExcuse/WriteExcuse";
import Feedback from "./pages/Feedback/Feedback";
import GoogleCallback from "./pages/LoginAndRegister/GoogleCallback";
import FeedbackList from "./pages/Feedback/FeedbackList/FeedbackList";
import EmailHistory from "./pages/EmailHistory/EmailHistory";
import axios from "./utils/axiosConfig";
import SecurityPage from "./pages/Securty/SecurityPage";
import ProtectedRoutes from "./utils/ProtectedRoutes";
function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = (data) => {
    const { access, refresh, user } = data;
    axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token && !refreshToken) {
        // No tokens at all — user never logged in
        setIsLoading(false);
        return;
      }

      if (token) {
        try {
          // Try to verify the access token first
          await axios.post("/auth/jwt/verify/", { token });
          const response = await axios.get("/auth/user/");
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
          setIsLoading(false);
          return;
        } catch (error) {
          // Access token expired or invalid — try to refresh
          console.log("Access token expired, trying refresh...");
        }
      }

      // Access token failed — try refresh token
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post("/auth/jwt/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access;

          // Save new access token
          localStorage.setItem("access_token", newAccessToken);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          // Get user data with new token
          const userResponse = await axios.get("/auth/user/");
          setUser(userResponse.data);
          localStorage.setItem("user", JSON.stringify(userResponse.data));
        } catch (error) {
          // Refresh token also expired — now we actually log out
          console.log("Refresh token expired, logging out...");
          handleLogout();
        }
      } else {
        handleLogout();
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/profile" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/auth/google/callback"
          element={<GoogleCallback setAuthData={setAuthData} />}
        />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/feedback" element={<Feedback user={user} />} />

        <Route element={<ProtectedRoutes user={user} />}>
          <Route path="/email-history" element={<EmailHistory />} />
          <Route
            path="/profile"
            element={<Profile user={user} handleLogout={handleLogout} />}
          />
          <Route path="/history" element={<History />} />
          <Route path="/write-excuse" element={<WriteExcuse user={user} />} />
          <Route path="/security" element={<SecurityPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
