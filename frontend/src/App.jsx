import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/LoginAndRegister/Login";
import Profile from "./pages/Profile/Profile";
import History from "./pages/History/History";
import WriteExcuse from "./pages/WriteExcuse/WriteExcuse";
import Feedback from "./pages/Feedback/Feedback";
import GoogleCallback from "./pages/LoginAndRegister/GoogleCallback";
import axios from "./utils/axiosConfig";

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

      if (token) {
        try {
          await axios.post("/auth/jwt/verify/", { token });
          const response = await axios.get("/auth/user/");
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          handleLogout();
        }
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
        <Route
          path="/history"
          element={user ? <History /> : <Navigate to="/login" />}
        />
        <Route
          path="/write-excuse"
          element={
            user ? <WriteExcuse user={user} /> : <Navigate to="/login" />
          }
        />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
