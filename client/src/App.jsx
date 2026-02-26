import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "student",
};

function App() {
  const [view, setView] = useState("login");
  const [form, setForm] = useState(initialFormState);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const heading = useMemo(() => {
    if (user) return `Welcome, ${user.fullName}`;
    return view === "login" ? "Sign in to UniLink" : "Create your UniLink account";
  }, [user, view]);

  const resetFeedback = () => {
    setMessage("");
    setError("");
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleApiError = async (res, fallbackMessage) => {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || fallbackMessage);
  };

  const loadCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      resetFeedback();

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setView("dashboard");
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const handleRegister = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        await handleApiError(res, "Registration failed.");
      }

      const data = await res.json();
      setUser(data.user);
      setView("dashboard");
      setMessage("Account created and logged in.");
      setForm(initialFormState);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!res.ok) {
        await handleApiError(res, "Login failed.");
      }

      const data = await res.json();
      setUser(data.user);
      setView("dashboard");
      setMessage("Login successful.");
      setForm(initialFormState);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    resetFeedback();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        await handleApiError(res, "Logout failed.");
      }

      setUser(null);
      setView("login");
      setMessage("You have logged out.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchView = (nextView) => {
    resetFeedback();
    setForm(initialFormState);
    setView(nextView);
  };

  if (loading) {
    return (
      <main className="scene">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <section className="glass panel">
          <h1>UniLink</h1>
          <p>Loading secure session...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="scene">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <section className="glass panel">
        <div className="brand-row">
          <p className="badge">University Network</p>
          <h1>{heading}</h1>
          <p className="subtext">
            Unified academic resources, verified announcements, and campus collaboration.
          </p>
        </div>

        {message && <p className="feedback success">{message}</p>}
        {error && <p className="feedback error">{error}</p>}

        {!user && (
          <div className="switch-row">
            <button
              className={view === "login" ? "tab active" : "tab"}
              type="button"
              onClick={() => switchView("login")}
            >
              Sign In
            </button>
            <button
              className={view === "register" ? "tab active" : "tab"}
              type="button"
              onClick={() => switchView("register")}
            >
              Register
            </button>
          </div>
        )}

        {!user && view === "register" && (
          <form className="stack" onSubmit={handleRegister}>
            <label>
              Full Name
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
                required
                placeholder="Ayesha Khan"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                required
                placeholder="you@university.edu"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => updateForm("role", event.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="cta" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}

        {!user && view === "login" && (
          <form className="stack" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                required
                placeholder="you@university.edu"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                required
                minLength={6}
                placeholder="Your password"
              />
            </label>
            <button className="cta" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {user && (
          <div className="dashboard">
            <div className="card">
              <h2>Profile</h2>
              <p>
                <strong>Name:</strong> {user.fullName}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
            <div className="card">
              <h2>UniLink Ready</h2>
              <p>JWT authentication is active with protected session-based access.</p>
              <p>Next, we can connect this account to notes, timetables, and campus feeds.</p>
            </div>
            <button className="danger" type="button" onClick={handleLogout} disabled={submitting}>
              {submitting ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
