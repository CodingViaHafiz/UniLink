import { useEffect, useState } from "react";

const CounterCard = ({ label, value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let startTime = 0;
    const duration = 900;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Math.round(value * progress));

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">{display}</p>
    </article>
  );
};

const StatsSection = ({ stats, isLoading }) => {
  return (
    <section id="about" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-blue-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Platform Statistics</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Real-time growth snapshot</h2>
        <p className="mt-2 text-sm text-slate-600">A quick view of community activity and content momentum across UniLink.</p>

        {isLoading ? (
          <p className="mt-5 text-sm font-semibold text-slate-500">Loading statistics...</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CounterCard label="Total Students" value={stats.totalStudents} />
            <CounterCard label="Total Faculty" value={stats.totalFaculty} />
            <CounterCard label="Total Blogs" value={stats.totalBlogs} />
            <CounterCard label="Total Courses" value={stats.totalCourses} />
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
