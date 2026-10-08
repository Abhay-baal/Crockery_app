"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo =
    searchParams.get("redirect") || "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      router.push(redirectTo);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-stone-600"
          >
            <ArrowLeft size={18} />
            Back to store
          </Link>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="text-sm font-medium text-stone-500">
              WELCOME BACK
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Sign in to continue with your purchase.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <label className="text-sm font-medium">
              Email
            </label>

            <div className="relative mt-2">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-stone-500"
              />
            </div>

            <label className="mt-5 block text-sm font-medium">
              Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="mt-5 text-center text-sm text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?redirect=${encodeURIComponent(
                  redirectTo
                )}`}
                className="font-semibold text-stone-900"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
