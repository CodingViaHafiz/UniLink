import { Link, useNavigate } from "react-router-dom";
import HomeNavbar from "../components/home/HomeNavbar";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { MotionPage } from "../lib/motion";

const AboutPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <MotionPage className="min-h-screen bg-slate-50">
      <HomeNavbar user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">About UniLink</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">A Modern University Platform</h1>
          </div>
          <Link
            to="/home"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">What we deliver</h2>
            <p className="mt-3 text-sm text-slate-600">
              UniLink brings resources, hostel listings, and faculty insights together in one clean, student-friendly hub.
              Students get quick access to verified academic material and trusted housing updates.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Why it matters</h2>
            <p className="mt-3 text-sm text-slate-600">
              By centralizing updates, dashboards, and learning assets, UniLink helps universities move faster and keeps
              academic communities aligned.
            </p>
          </div>
        </div>
      </section>
    </MotionPage>
  );
};

export default AboutPage;
