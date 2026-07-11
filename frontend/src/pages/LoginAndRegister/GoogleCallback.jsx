import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosConfig";

const GoogleCallback = ({ setAuthData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          // Send the code to your backend
          const response = await axios.post("/auth/google/callback/", {
            code: code,
          });

          const { access, refresh, user } = response.data;

          // Set auth data
          axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
          localStorage.setItem("user", JSON.stringify(user));

          if (setAuthData) {
            setAuthData(response.data);
          }

          navigate("/profile");
        } catch (error) {
          console.error(
            "Google callback error:",
            error.response?.data || error
          );
          navigate("/login?error=google_auth_failed");
        }
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, setAuthData]);

  return (
    <div
      style={{
        padding: "50px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Completing Google Login...</h2>
      <p>Please wait while we redirect you.</p>
    </div>
  );
};

export default GoogleCallback;
