import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MotionPage } from "../lib/motion";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  role: "student",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    const nextPath = location.state?.from?.pathname || "/home";
    return <Navigate to={nextPath === "/login" ? "/home" : nextPath} replace />;
  }

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        await register(form);
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
        <p className="mt-2 text-sm text-slate-500">All users land on the common Home page after successful authentication.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              mode === "login" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              mode === "register"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
            onClick={() => setMode("register")}
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
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
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
              minLength={6}
              required
            />
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Role</span>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                value={form.role}
                onChange={(event) => updateForm("role", event.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </section>
    </MotionPage>
  );
};

export default AuthPage;
