import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const initialForm = { fullName: "", email: "", password: "", enrollmentNumber: "" };

// Enrollment number lookup states
const LOOKUP_IDLE = "idle";
const LOOKUP_LOADING = "loading";
const LOOKUP_VALID = "valid";
const LOOKUP_INVALID = "invalid";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Enrollment number lookup
  const [lookupState, setLookupState] = useState(LOOKUP_IDLE);
  const [lookupInfo, setLookupInfo] = useState(null); // { department, program, batch }
  const lookupDebounce = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const nextPath = location.state?.from?.pathname || "/home";
      navigate(nextPath === "/login" ? "/home" : nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm(initialForm);
    setError("");
    setShowPasswordRules(false);
    setLookupState(LOOKUP_IDLE);
    setLookupInfo(null);
  };

  // Debounced enrollment number lookup
  const handleEnrollmentChange = (value) => {
    updateForm("enrollmentNumber", value);
    setLookupInfo(null);

    if (lookupDebounce.current) clearTimeout(lookupDebounce.current);

    const trimmed = value.trim().toUpperCase();
    if (!trimmed) { setLookupState(LOOKUP_IDLE); return; }

    setLookupState(LOOKUP_LOADING);
    lookupDebounce.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/auth/enrollment/${encodeURIComponent(trimmed)}`, { method: "GET" });
        setLookupState(LOOKUP_VALID);
        setLookupInfo({ department: data.department, program: data.program, batch: data.batch });
      } catch {
        setLookupState(LOOKUP_INVALID);
      }
    }, 500);
  };

  // Cleanup debounce on unmount
  useEffect(() => () => { if (lookupDebounce.current) clearTimeout(lookupDebounce.current); }, []);

  const handleResendVerification = async (email) => {
    setIsResending(true);
    setResendMessage("");
    try {
      const data = await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendMessage(data.message);
    } catch (err) {
      setResendMessage(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (mode === "register" && lookupState !== LOOKUP_VALID) {
      setError("Please enter a valid enrollment number before continuing.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setVerificationSent(false);
    setUnverifiedEmail("");
    try {
      if (mode === "register") {
        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            enrollmentNumber: form.enrollmentNumber,
          }),
        });
        if (data.needsVerification) {
          setVerificationSent(true);
          return;
        }
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/home", { replace: true });
    } catch (submitError) {
      // Login blocked because email not verified
      if (submitError.message?.includes("verify your email")) {
        setUnverifiedEmail(form.email);
      }
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionPage className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          UniLink Access
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
          {mode === "login" ? "Sign in to UniLink" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login"
            ? "Faculty and admin accounts are created by the administrator."
            : "Student registration requires your university enrollment number."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {["login", "register"].map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${mode === m
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              onClick={() => switchMode(m)}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* ── Verification email sent (after registration) ── */}
        {verificationSent && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-black text-emerald-900">Check your email!</h3>
            <p className="mt-1 text-sm text-emerald-700">
              We've sent a verification link to <strong>{form.email}</strong>.
              Click the link to activate your account.
            </p>
            <p className="mt-3 text-xs text-emerald-600">
              Didn't receive it?{" "}
              <button
                type="button"
                className="font-bold underline"
                onClick={() => handleResendVerification(form.email)}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend email"}
              </button>
            </p>
            {resendMessage && (
              <p className="mt-2 text-xs font-semibold text-emerald-700">{resendMessage}</p>
            )}
            <button
              type="button"
              className="btn-press mt-4 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
              onClick={() => { setVerificationSent(false); switchMode("login"); }}
            >
              Go to Sign In
            </button>
          </div>
        )}

        <form className={`mt-4 space-y-3 ${verificationSent ? "hidden" : ""}`} onSubmit={onSubmit}>
          {/* Full Name */}
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                placeholder="e.g. Muhammad Ali"
                value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
                required
              />
            </label>
          )}

          {/* Enrollment Number — register only */}
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Enrollment Number
              </span>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 pr-9 text-sm uppercase outline-none ring-blue-200 focus:ring-2 ${lookupState === LOOKUP_VALID
                    ? "border-emerald-400 bg-emerald-50"
                    : lookupState === LOOKUP_INVALID
                      ? "border-rose-400 bg-rose-50"
                      : "border-slate-300"
                    }`}
                  placeholder="e.g. FA21-BCS-001"
                  value={form.enrollmentNumber}
                  onChange={(e) => handleEnrollmentChange(e.target.value)}
                  required
                />
                {/* Status icon */}
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base">
                  {lookupState === LOOKUP_LOADING && (
                    <svg className="h-4 w-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {lookupState === LOOKUP_VALID && (
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {lookupState === LOOKUP_INVALID && (
                    <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
              </div>

              {/* Auto-filled info */}
              {lookupState === LOOKUP_VALID && lookupInfo && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "Department", value: lookupInfo.department },
                    { label: "Program", value: lookupInfo.program },
                    { label: "Batch", value: lookupInfo.batch },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">{label}</p>
                      <p className="text-xs font-semibold text-emerald-800">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {lookupState === LOOKUP_INVALID && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  Enrollment number not found or already registered. Contact the admin.
                </p>
              )}
            </label>
          )}

          {/* Email */}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email Address</span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              required
            />
          </label>

          {/* Password */}
          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              {mode === "login" && (
                <a href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              onFocus={() => mode === "register" && setShowPasswordRules(true)}
              minLength={8}
              required
            />
            {mode === "register" && showPasswordRules && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs font-medium ${passed ? "text-emerald-600" : "text-slate-400"
                        }`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${passed ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </label>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              <p>{error}</p>
              {unverifiedEmail && (
                <div className="mt-2 border-t border-rose-100 pt-2">
                  <button
                    type="button"
                    className="text-xs font-bold text-blue-600 underline"
                    onClick={() => handleResendVerification(unverifiedEmail)}
                    disabled={isResending}
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </button>
                  {resendMessage && (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">{resendMessage}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || (mode === "register" && lookupState === LOOKUP_LOADING)}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "register"
                ? "Create Student Account"
                : "Sign In"}
          </button>
        </form>
      </section>
    </MotionPage>
  );
};

export default AuthPage;
