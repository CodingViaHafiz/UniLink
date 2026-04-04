import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) {
      setError("Please satisfy all password requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/auth/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">Password Reset!</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          UniLink
        </p>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Reset Your Password</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new secure password for your account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* New Password */}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">New Password</span>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-200 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowRules(true)}
              required
              autoComplete="new-password"
            />
            {showRules && (
              <ul className="mt-2.5 space-y-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                        passed ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                          passed ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      >
                        {passed && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </label>

          {/* Confirm Password */}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Confirm Password</span>
            <input
              type="password"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-blue-200 focus:ring-2 ${
                confirm && confirm !== password
                  ? "border-rose-400 bg-rose-50"
                  : confirm && confirm === password
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-300"
              }`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <p className="mt-1 text-xs font-medium text-rose-600">Passwords do not match.</p>
            )}
          </label>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              <p>{error}</p>
              {error.toLowerCase().includes("invalid or has expired") && (
                <p className="mt-1 text-xs font-normal">
                  <Link to="/forgot-password" className="font-bold underline">
                    Request a new reset link
                  </Link>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !allRulesPassed || password !== confirm}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Resetting…" : "Reset Password"}
          </button>

          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
