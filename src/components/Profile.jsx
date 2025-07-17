import React from "react";
import { useState } from "react";
import { apiFetch } from "../api";

const Profile = ({ user }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPassword !== confirmPassword) {
      setMsg("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword })
      });
      setMsg("Password changed successfully.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setMsg(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-2"><strong>Name:</strong> {user.name}</div>
      <div className="mb-2"><strong>Email:</strong> {user.email}</div>
      <hr className="my-6" />
      <h3 className="text-xl font-bold mb-2">Change Password</h3>
      <form onSubmit={handleChangePassword} className="space-y-3">
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold w-full" disabled={loading}>{loading ? "Changing..." : "Change Password"}</button>
        {msg && <div className="text-center text-sm mt-2 text-red-600">{msg}</div>}
      </form>
    </div>
  );
};

export default Profile; 