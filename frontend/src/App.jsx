import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  // Use environment variable for production, fallback to localhost
  const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [userData, setUserData] = useState(null);
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPhone = localStorage.getItem("social_phone");

    if (savedPhone) {
      setPhone(savedPhone);
      fetchUserData(savedPhone);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (phoneNumber) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      // If it's a 404 or other error, we might want to clear the session
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (data) => {
    localStorage.setItem("social_phone", data.phone);
    setPhone(data.phone);
    setUserData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("social_phone");
    setPhone(null);
    setUserData(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse tracking-wider">Loading Social Saver...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <Login setUserData={handleLogin} />;
  }

  return (
    <Dashboard
      userData={userData}
      logout={handleLogout}
      refresh={() => fetchUserData(phone)}
      baseUrl={BASE_URL}
    />
  );
}