import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(username, password);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      navigate("/kyc-admin", { replace: true });
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm" role="alert">{error}</div>
      )}
      <div className="space-y-2">
        <label className="text-white text-sm">Username</label>
        <input
          className="w-full rounded-md bg-transparent border border-slate-700 px-3 py-2 text-white outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <label className="text-white text-sm">Password</label>
        <input
          className="w-full rounded-md bg-transparent border border-slate-700 px-3 py-2 text-white outline-none"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 text-white py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}


