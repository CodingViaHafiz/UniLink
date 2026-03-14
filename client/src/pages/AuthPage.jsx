import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MotionPage } from "../lib/motion";

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  department: "",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    const nextPath = location.state?.from?.pathname || "/home";
    return <Navigate to={nextPath === "/login" ? "/home" : nextPath} replace />;
  }

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm(initialForm);
    setError("");
    setShowPasswordRules(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          department: form.department,
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/home", { replace: true });
    } catch (submitError) {
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
            : "Student self-registration. Faculty accounts are assigned by admin."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              mode === "login"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              mode === "register"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                placeholder="e.g. Muhammad Ali"
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email Address</span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
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
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        passed ? "text-emerald-600" : "text-slate-400"
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

          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Department</span>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                value={form.department}
                onChange={(event) => updateForm("department", event.target.value)}
              >
                <option value="">Select department (optional)</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
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
