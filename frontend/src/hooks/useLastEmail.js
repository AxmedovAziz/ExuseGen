import { useState, useEffect } from "react";

const useLastEmail = () => {
  const [lastEmail, setLastEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastEmail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setLastEmail(null);
          return;
        }
        const response = await fetch("http://127.0.0.1:8000/auth/last-email/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch last email");
        const data = await response.json();
        setLastEmail(data.last_email);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLastEmail();
  }, []);

  return { lastEmail, loading, error };
};

export default useLastEmail;
