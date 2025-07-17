import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword })
      });
      setMsg("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-600 to-blue-600">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Reset Password</h2>
        <input type="password" className="w-full border rounded px-3 py-2 mb-3" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <input type="password" className="w-full border rounded px-3 py-2 mb-3" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
        {msg && <div className="mt-4 text-center text-red-600">{msg}</div>}
      </form>
    </div>
  );
};

export default ResetPassword; 