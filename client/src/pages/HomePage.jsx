import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogSection from "../components/home/BlogSection";
import HeroSection from "../components/home/HeroSection";
import HomeFooter from "../components/home/HomeFooter";
import HomeNavbar from "../components/home/HomeNavbar";
import StatsSection from "../components/home/StatsSection";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalBlogs: 0,
    totalResources: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setBlogsLoading(true);
        setBlogsError("");
        const data = await apiFetch("/blogs", { method: "GET" });
        setBlogs(data.blogs || []);
      } catch (error) {
        setBlogsError(error.message);
      } finally {
        setBlogsLoading(false);
      }
    };

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await apiFetch("/blogs/stats", { method: "GET" });
        setStats(data.stats);
      } catch {
        setStats({
          totalStudents: 0,
          totalFaculty: 0,
          totalBlogs: 0,
          totalResources: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadBlogs();
    loadStats();
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
      <HeroSection user={user} />
      <BlogSection blogs={blogs} isLoading={blogsLoading} error={blogsError} />
      <StatsSection stats={stats} isLoading={statsLoading} />
      <HomeFooter />
    </MotionPage>
  );
};

export default HomePage;
