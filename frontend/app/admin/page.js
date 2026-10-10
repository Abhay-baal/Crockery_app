"use client";

import { useState } from "react";
import api from "../../services/api";

export default function AdminLoginPage() {
  const [accessKey, setAccessKey] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await api.post("/admin/login", {
        accessKey,
        username,
        password,
      });

      if (!response.data?.token) {
        throw new Error("The server did not return an admin token.");
      }

      localStorage.setItem("adminToken", response.data.token);
      window.location.assign("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Admin login failed."
      );
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-500 outline-none focus:border-[#70765F] focus:ring-2 focus:ring-[#70765F]/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F2] px-5 py-10 text-stone-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-stone-300 bg-white p-7 shadow-sm sm:p-9"
      >
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#70765F] text-xl font-semibold text-white">
          M
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#555B46]">
          Magotra Bartan Store
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          Private access for store management.
        </p>

        <label className="mt-7 block text-sm font-medium">
          Access key
          <input
            className={inputClass}
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            type="password"
            autoComplete="off"
            required
            placeholder="Enter access key"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Username
          <input
            className={inputClass}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            className={inputClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter password"
          />
        </label>

        <button
          className="mt-6 w-full rounded-xl bg-[#70765F] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#5F654F] disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Open dashboard"}
        </button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-stone-600">
          Admin access is separate from customer sign-in.
        </p>
      </form>
    </main>
  );
}
