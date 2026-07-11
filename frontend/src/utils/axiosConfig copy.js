import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// Add token to requests if it exists
const token = localStorage.getItem("access_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Add request interceptor to ensure CSRF token is sent
axios.interceptors.request.use(
  (config) => {
    // For POST requests, ensure we have CSRF token
    if (config.method === "post") {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
