import { Link } from "react-router-dom";

const QuickActions = ({ items = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-black tracking-tight text-slate-900">Quick Actions</h2>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">3</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
