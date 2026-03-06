import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import uniLinkLogo from "../../assets/unilink-logo-campus.svg";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminSidebarSections } from "../../constants/adminConfig";
import { useAuth } from "../../hooks/useAuth";

const AdminLayoutPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} sections={adminSidebarSections} />

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 p-3 sm:p-4">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 rounded-full border border-sky-100 bg-white/90 px-3 py-2 text-slate-800 shadow-[0_14px_34px_-18px_rgba(2,132,199,0.45)] backdrop-blur">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                Menu
              </button>
              <span className="inline-flex min-w-0 items-center gap-2 rounded-full pr-2">
                <img src={uniLinkLogo} alt="UniLink logo" className="h-9 w-9 rounded-full" />
                <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
                  UniLink
                </span>
              </span>
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Admin Session</p>
                <p className="text-xs font-bold text-slate-700">{user?.fullName || "Admin User"}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 transition-colors hover:bg-sky-100" to="/home">
                Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayoutPage;
