import { useState } from "react";

export default function Login({ setUserData }) {

  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      setUserData(data);

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl mb-4">Login</h1>

      <input
        type="text"
        placeholder="+44191572848656"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-2 text-black rounded"
      />

      <button
        onClick={handleLogin}
        className="mt-4 bg-blue-500 px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}