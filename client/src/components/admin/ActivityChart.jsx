/**
 * Admin dashboard charts — Donut (user distribution) + Multi-series line (monthly activity).
 *
 * Props:
 *   stats    — { totalStudents, totalFaculty, totalAdmins }
 *   activity — [{ label, users, blogs, resources, total }]
 */

/* ─────────────────────────────────────────
   Donut Chart
───────────────────────────────────────── */

const DONUT_SEGMENTS = [
  { key: "totalStudents", label: "Students", color: "#8b5cf6" },
  { key: "totalFaculty", label: "Faculty", color: "#3b82f6" },
  { key: "totalAdmins", label: "Admins", color: "#10b981" },
];

const DonutChart = ({ stats }) => {
  const total = DONUT_SEGMENTS.reduce((sum, s) => sum + (stats[s.key] || 0), 0);
  const size = 160;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = DONUT_SEGMENTS.map((seg) => {
    const value = stats[seg.key] || 0;
    const pct = total > 0 ? value / total : 0;
    const dashLen = pct * circumference;
    const arc = { ...seg, value, pct, dashLen, offset };
    offset += dashLen;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Background ring */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {/* Colored arcs */}
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={`${arc.dashLen} ${circumference - arc.dashLen}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{total}</span>
          <span className="text-[10px] font-semibold text-slate-400">Users</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {arcs.map((arc) => (
          <div key={arc.key} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: arc.color }} />
            <span className="text-xs font-semibold text-slate-600">{arc.label}</span>
            <span className="text-xs font-bold text-slate-400">{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Multi-series Line Chart
───────────────────────────────────────── */

const SERIES = [
  { key: "users", label: "Users", color: "#8b5cf6", fill: "rgba(139,92,246,0.12)" },
  { key: "blogs", label: "Blogs", color: "#f59e0b", fill: "rgba(245,158,11,0.10)" },
  { key: "resources", label: "Resources", color: "#10b981", fill: "rgba(16,185,129,0.10)" },
];

const MultiLineChart = ({ activity = [] }) => {
  const width = 520;
  const height = 220;
  const pt = 28; // padding top
  const pb = 28; // padding bottom
  const pl = 36; // padding left
  const pr = 16; // padding right
  const chartW = width - pl - pr;
  const chartH = height - pt - pb;

  // Find max value across all series
  const maxY = Math.max(
    ...activity.flatMap((d) => SERIES.map((s) => d[s.key] || 0)),
    1
  ) + 1;

  // Y-axis gridlines (5 lines)
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxY / 4) * i));

  // Build polyline points for a series
  const getPoints = (key) =>
    activity.map((d, i) => {
      const x = pl + (i * chartW) / Math.max(activity.length - 1, 1);
      const y = pt + chartH - ((d[key] || 0) / maxY) * chartH;
      return { x, y };
    });

  // Build fill polygon points (closed area under curve)
  const getFillPoints = (pts) => {
    if (pts.length === 0) return "";
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${first.x},${pt + chartH} ${pts.map((p) => `${p.x},${p.y}`).join(" ")} ${last.x},${pt + chartH}`;
  };

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-semibold text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 min-w-120 w-full">
          {/* Y gridlines + labels */}
          {yTicks.map((tick) => {
            const y = pt + chartH - (tick / maxY) * chartH;
            return (
              <g key={tick}>
                <line x1={pl} y1={y} x2={width - pr} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={pl - 6} y={y + 3.5} textAnchor="end" className="fill-slate-400 text-[10px]">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Series — fill area + line + dots */}
          {SERIES.map((s) => {
            const pts = getPoints(s.key);
            if (pts.length === 0) return null;
            return (
              <g key={s.key}>
                <polygon fill={s.fill} points={getFillPoints(pts)} />
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={s.color} strokeWidth="2" />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {activity.map((d, i) => {
            const x = pl + (i * chartW) / Math.max(activity.length - 1, 1);
            return (
              <text key={d.label} x={x} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold">
                {d.label.split(" ")[0]}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Combined export
───────────────────────────────────────── */

const ActivityChart = ({ stats = {}, activity = [] }) => (
  <section className="grid gap-5 md:grid-cols-[240px_1fr]">
    {/* Donut — user distribution */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-500">User Distribution</h3>
      <DonutChart stats={stats} />
    </div>

    {/* Multi-series line — monthly activity */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-end justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Monthly Activity</h3>
        <p className="text-[10px] font-semibold text-slate-400">Last 6 months</p>
      </div>
      <MultiLineChart activity={activity} />
    </div>
  </section>
);

export default ActivityChart;
