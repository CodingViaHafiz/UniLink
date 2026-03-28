import { useEffect, useState } from "react";
import { MotionSection } from "../../lib/motion";

const CountUp = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) return;
    let raf = 0;
    let start = 0;
    const duration = 800;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
};

const statItems = [
  {
    key: "totalStudents",
    label: "Students",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    key: "totalFaculty",
    label: "Faculty",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "totalBlogs",
    label: "Blogs Published",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    key: "totalResources",
    label: "Resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const StatsSection = ({ stats, isLoading }) => {
  // Only show stats that have a value > 0
  const activeStats = statItems.filter((s) => stats[s.key] > 0);

  if (isLoading) {
    return (
      <MotionSection className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500" />
        </div>
      </MotionSection>
    );
  }

  if (activeStats.length === 0) return null;

  return (
    <MotionSection
      id="stats"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">Platform at a Glance</h2>
            <p className="text-xs text-slate-500">Live numbers across UniLink</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {activeStats.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
            >
              <div className={`shrink-0 rounded-xl p-2.5 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-900">
                  <CountUp value={stats[item.key]} />
                </p>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default StatsSection;
