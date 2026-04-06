import { MotionSection } from "../../lib/motion";
import UserAvatar from "../common/UserAvatar";
import UpcomingCalendar from "./UpcomingCalendar";

const roleBadge = {
  student: { label: "Student", cls: "bg-sky-100 text-sky-700" },
  faculty: { label: "Faculty", cls: "bg-blue-100 text-blue-700" },
  admin: { label: "Administrator", cls: "bg-emerald-100 text-emerald-700" },
};

const HeroSection = ({ user }) => {
  const badge = roleBadge[user?.role] || roleBadge.student;
  const firstName = user?.fullName;

  // .split(" ")[0] || "there";  for first name only
  // Sub-info shown in profile card depending on role
  const subInfo = (() => {
    if (user?.role === "student") {
      const parts = [user?.program, user?.batch].filter(Boolean);
      return parts.length ? parts.join(" · ") : user?.department || null;
    }
    if (user?.role === "faculty") return user?.department || null;
    if (user?.role === "admin") return user?.department || "Administration";
    return null;
  })();

  return (
    <MotionSection id="home" className="scroll-mt-24 px-3 sm:px-6 lg:px-8">
      {/* Unified rounded container — border-radius and border applied once */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-stretch">

        {/* ── Left — dark gradient hero (60%) ── */}
        <div className="bg-linear-to-br from-slate-900 via-blue-950 to-cyan-900 text-white lg:w-3/5">
          <div className="px-6 py-10 sm:px-8 sm:py-14 lg:py-16 lg:pr-10">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>

            <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl lg:text-4xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
              Your academic hub — access resources, stay updated with blogs,
              and explore everything UniLink has to offer.
            </p>

            {/* Mini profile card */}
            <div className="mt-6 w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <UserAvatar user={user} className="h-10 w-10 rounded-full shadow-md" textSize="text-sm" />
                {/* Info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">
                    {user?.fullName || "User"}
                  </p>
                  <p className="truncate text-xs text-blue-300 leading-tight mt-0.5">
                    {user?.email || ""}
                  </p>
                  {subInfo && (
                    <p className="mt-1 truncate text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                      {subInfo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right — Calendar on white bg (40%) ── */}
        <div className="border-t border-slate-200 bg-white lg:w-2/5 lg:border-t-0 lg:border-l">
          <div className="h-full px-4 py-6 sm:px-6 lg:px-5 lg:py-8">
            <UpcomingCalendar />
          </div>
        </div>

      </div>
    </MotionSection>
  );
};

export default HeroSection;
