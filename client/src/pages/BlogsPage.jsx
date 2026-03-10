import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BlogSection from "../components/home/BlogSection";
import HomeNavbar from "../components/home/HomeNavbar";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const BlogsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/blogs", { method: "GET" });
        setBlogs(data.blogs || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

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
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-2 flex justify-end">
          <Link
            to="/home"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Back to Home
          </Link>
        </div>
      </section>
      <BlogSection blogs={blogs} isLoading={isLoading} error={error} />
    </MotionPage>
  );
};

export default BlogsPage;
