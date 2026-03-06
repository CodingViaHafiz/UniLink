const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const RecentActivityPanel = ({ activity = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-black tracking-tight text-slate-900">Recent Activity</h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{activity.length}</span>
      </div>
      <div className="space-y-3">
        {activity.length === 0 && <p className="text-sm text-slate-500">No recent activity found.</p>}
        {activity.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{item.meta}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentActivityPanel;
