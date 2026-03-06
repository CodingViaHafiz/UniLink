import { NavLink } from "react-router-dom";

const getLinkClasses = ({ isActive }) =>
  [
    "block rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-sky-100 text-sky-700 shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

const AdminSidebar = ({ isOpen, setIsOpen, sections }) => {
  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Admin Panel</p>
            <h1 className="text-lg font-black tracking-tight text-slate-900">UniLink Control Center</h1>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">{section.title}</p>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    end={link.to === "/admin-dashboard"}
                    to={link.to}
                    className={getLinkClasses}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
