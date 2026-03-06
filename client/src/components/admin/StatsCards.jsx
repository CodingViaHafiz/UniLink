import { useEffect, useMemo, useState } from "react";

const useCountUp = (target, durationMs = 1000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const finalTarget = Number(target) || 0;
    if (finalTarget <= 0) {
      return undefined;
    }

    const stepTime = Math.max(Math.floor(durationMs / finalTarget), 16);
    const timer = setInterval(() => {
      start += Math.max(1, Math.ceil(finalTarget / (durationMs / stepTime)));
      if (start >= finalTarget) {
        setValue(finalTarget);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [durationMs, target]);

  return value;
};

const StatCard = ({ item }) => {
  const animatedValue = useCountUp(item.value);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <p className="text-sm font-semibold text-slate-500">{item.label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{animatedValue.toLocaleString()}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{item.hint}</p>
    </article>
  );
};

const StatsCards = ({ stats }) => {
  const cards = useMemo(
    () => [
      { label: "Total Users", value: stats.totalUsers, hint: "All registered accounts" },
      { label: "Total Faculty", value: stats.totalFaculty, hint: "Faculty-level accounts" },
      { label: "Total Blogs", value: stats.totalBlogs, hint: "Published admin/faculty blogs" },
      { label: "Total Students", value: stats.totalStudents, hint: "Student accounts" },
      { label: "Total Admins", value: stats.totalAdmins, hint: "Privileged operators" },
    ],
    [stats]
  );

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Platform Metrics</h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live overview</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.label} item={card} />
        ))}
      </div>
    </section>
  );
};

export default StatsCards;
