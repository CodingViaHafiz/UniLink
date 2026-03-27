import { useEffect, useState } from "react";
import BlogSection from "../components/home/BlogSection";
import HeroSection from "../components/home/HeroSection";
import HomeFooter from "../components/home/HomeFooter";
import HomeNavbar from "../components/home/HomeNavbar";
import NoticeBanner from "../components/home/NoticeBanner";
import StatsSection from "../components/home/StatsSection";
import VisionMission from "../components/home/VisionMission";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const HomePage = () => {
  const { user } = useAuth();
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

  return (
    <MotionPage className="min-h-screen bg-slate-50">
      <HomeNavbar user={user} />
      <NoticeBanner />
      <HeroSection user={user} />
      <VisionMission />
      <BlogSection blogs={blogs} isLoading={blogsLoading} error={blogsError} />
      <StatsSection stats={stats} isLoading={statsLoading} />
      <HomeFooter />
    </MotionPage>
  );
};

export default HomePage;
