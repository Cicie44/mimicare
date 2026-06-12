import { useState } from "react";
import * as authService from "../../services/authService";

type Props = {
  onAuthSuccess: () => void;
};

type Mode = "login" | "signup";

export default function AuthPage({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await authService.signIn(email, password);
        onAuthSuccess();
      } else {
        await authService.signUp(email, password);
        setSignupSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-10 w-full max-w-sm text-center">
          <p className="text-5xl mb-4">📬</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email!</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>.
            Please click it to activate your account, then come back to log in.
          </p>
          <button
            onClick={() => { setMode("login"); setSignupSuccess(false); setPassword(""); }}
            className="btn-primary w-full"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-5xl mb-2">🐾</p>
          <h1 className="text-2xl font-bold text-rose-400">MimiCare</h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === "login" ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </p>
        </div>

        <div className="flex rounded-xl bg-orange-50 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === "login" ? "bg-white text-rose-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === "signup" ? "bg-white text-rose-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              required
              minLength={6}
              className="input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-500">
              😿 {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
              ? "Log In 🐾"
              : "Create Account 🐾"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-300 mt-6">
          Your pet care data is private and secure. 🔒
        </p>
      </div>
    </div>
  );
}
