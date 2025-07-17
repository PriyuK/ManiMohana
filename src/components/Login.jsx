import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail })
      });
      setForgotMsg("If that email exists, a reset link has been sent.");
    } catch (err) {
      setForgotMsg(err.message || "Failed to send reset link.");
    }
  };

  if (showForgot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-600 to-blue-600">
        <form onSubmit={handleForgot} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Forgot Password</h2>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition">Send Reset Link</button>
          {forgotMsg && <div className="mt-4 text-green-600 text-center">{forgotMsg}</div>}
          <div className="mt-4 text-center">
            <button type="button" className="text-teal-600 hover:underline" onClick={() => setShowForgot(false)}>Back to Login</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-600 to-blue-600">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition">Login</button>
        <div className="mt-4 text-center">
          <button type="button" className="text-teal-600 hover:underline" onClick={() => setShowForgot(true)}>Forgot Password?</button>
        </div>
        <div className="mt-4 text-center">
          Don't have an account? <Link to="/signup" className="text-teal-600 hover:underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 