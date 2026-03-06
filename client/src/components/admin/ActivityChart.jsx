const maxFromData = (activity) => {
  const highest = Math.max(...activity.map((item) => item.total), 1);
  return highest + 2;
};

const ActivityChart = ({ activity = [] }) => {
  const width = 720;
  const height = 260;
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxY = maxFromData(activity);

  const points = activity.map((item, index) => {
    const x = padding + (index * chartWidth) / Math.max(activity.length - 1, 1);
    const y = padding + chartHeight - (item.total / maxY) * chartHeight;
    return `${x},${y}`;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Activity Trend</h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Users + Blogs per month</p>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 min-w-[680px] w-full">
          <defs>
            <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((step) => {
            const y = padding + (step * chartHeight) / 4;
            return <line key={step} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}

          {activity.length > 0 && (
            <>
              <polyline
                fill={`url(#activityFill)`}
                stroke="none"
                points={`${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`}
              />
              <polyline fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" points={points.join(" ")} />
            </>
          )}

          {activity.map((item, index) => {
            const x = padding + (index * chartWidth) / Math.max(activity.length - 1, 1);
            const y = padding + chartHeight - (item.total / maxY) * chartHeight;

            return (
              <g key={item.label}>
                <circle cx={x} cy={y} r="4.5" fill="#0ea5e9" />
                <text x={x} y={height - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-semibold">
                  {item.label.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};

export default ActivityChart;
