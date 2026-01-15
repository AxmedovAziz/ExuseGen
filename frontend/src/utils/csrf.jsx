import axios from "axios";

// Get CSRF token from cookies
export function getCSRFToken() {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookieValue || "";
}

// Configure axios defaults
export function configureAxios() {
  // Set base URL
  axios.defaults.baseURL = "http://localhost:8000";

  // Important: Include credentials for cookies
  axios.defaults.withCredentials = true;

  // Set CSRF token for all requests
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";

  // Interceptor to ensure CSRF token is included
  axios.interceptors.request.use(
    (config) => {
      // Only set for mutating methods
      if (
        ["post", "put", "patch", "delete"].includes(
          config.method?.toLowerCase()
        )
      ) {
        const token = getCSRFToken();
        if (token) {
          config.headers["X-CSRFToken"] = token;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}
