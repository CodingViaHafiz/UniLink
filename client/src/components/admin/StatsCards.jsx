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
    <article className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${item.border}`}>
      <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-15 ${item.bg}`} />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg}`}>
            {item.icon}
          </div>
          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
        </div>
        <p className={`mt-3 text-3xl font-black tracking-tight ${item.text}`}>{animatedValue.toLocaleString()}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">{item.hint}</p>
      </div>
    </article>
  );
};

const StatsCards = ({ stats }) => {
  const cards = useMemo(
    () => [
      {
        label: "Total Users", value: stats.totalUsers, hint: "All registered accounts",
        border: "border-sky-200 bg-white", bg: "bg-sky-500", iconBg: "bg-sky-100", text: "text-sky-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      },
      {
        label: "Students", value: stats.totalStudents, hint: "Student accounts",
        border: "border-violet-200 bg-white", bg: "bg-violet-500", iconBg: "bg-violet-100", text: "text-violet-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3-2.5l3 2.5 3-2.5" /></svg>,
      },
      {
        label: "Faculty", value: stats.totalFaculty, hint: "Faculty-level accounts",
        border: "border-blue-200 bg-white", bg: "bg-blue-500", iconBg: "bg-blue-100", text: "text-blue-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      },
      {
        label: "Admins", value: stats.totalAdmins, hint: "Privileged operators",
        border: "border-emerald-200 bg-white", bg: "bg-emerald-500", iconBg: "bg-emerald-100", text: "text-emerald-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      },
      {
        label: "Blogs", value: stats.totalBlogs, hint: "Published blogs",
        border: "border-amber-200 bg-white", bg: "bg-amber-500", iconBg: "bg-amber-100", text: "text-amber-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
      },
      {
        label: "Resources", value: stats.totalResources, hint: "Academic resources",
        border: "border-rose-200 bg-white", bg: "bg-rose-500", iconBg: "bg-rose-100", text: "text-rose-700",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      },
    ],
    [stats]
  );

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Platform Metrics</h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live overview</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} item={card} />
        ))}
      </div>
    </section>
  );
};

export default StatsCards;
