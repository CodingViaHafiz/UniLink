import { useEffect, useState } from "react";
import ActivityChart from "../../components/admin/ActivityChart";
import QuickActions from "../../components/admin/QuickActions";
import RecentActivityPanel from "../../components/admin/RecentActivityPanel";
import StatsCards from "../../components/admin/StatsCards";
import { quickActionLinks } from "../../constants/adminConfig";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

const defaultStats = {
  totalUsers: 0,
  totalStudents: 0,
  totalFaculty: 0,
  totalAdmins: 0,
  totalBlogs: 0,
};

const AdminOverviewPage = () => {
  const [stats, setStats] = useState(defaultStats);
  const [activity, setActivity] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, activityResponse, recentResponse] = await Promise.all([
          apiFetch("/admin/stats", { method: "GET" }),
          apiFetch("/admin/activity", { method: "GET" }),
          apiFetch("/admin/recent-activity", { method: "GET" }),
        ]);

        setStats(statsResponse.stats || defaultStats);
        setActivity(activityResponse.activity || []);
        setRecentActivity(recentResponse.activity || []);
      } catch {
        setStats(defaultStats);
        setActivity([]);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (isLoading) {
    return (
      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Loading admin analytics...</p>
      </main>
    );
  }

  return (
    <MotionPage className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Centralized control for users, content moderation, media, and platform operations.
        </p>
      </section>

      <StatsCards stats={stats} />

      <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <ActivityChart activity={activity} />
        <div className="space-y-5">
          <QuickActions items={quickActionLinks} />
          <RecentActivityPanel activity={recentActivity} />
        </div>
      </section>
    </MotionPage>
  );
};

export default AdminOverviewPage;

