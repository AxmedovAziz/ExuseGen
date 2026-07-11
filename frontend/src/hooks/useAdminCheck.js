import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAdminCheck = ({ redirectIfNotAdmin = false } = {}) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthLoading(false);
        setIsAdmin(false);
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch user info");

        const user = await response.json();

        const admin =
          user.is_staff === true ||
          user.is_superuser === true ||
          user.is_admin === true ||
          user.role === "admin" ||
          user.role === "Admin";

        setIsAdmin(admin);

        // FeedbackList needs this — redirect non-admins away
        if (redirectIfNotAdmin && !admin) {
          navigate("/");
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, authLoading };
};

export default useAdminCheck;
