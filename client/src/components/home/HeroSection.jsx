import { MotionSection } from "../../lib/motion";
import UpcomingCalendar from "./UpcomingCalendar";

const roleBadge = {
  student: { label: "Student", cls: "bg-sky-100 text-sky-700" },
  faculty: { label: "Faculty", cls: "bg-blue-100 text-blue-700" },
  admin: { label: "Administrator", cls: "bg-emerald-100 text-emerald-700" },
};

const HeroSection = ({ user }) => {
  const badge = roleBadge[user?.role] || roleBadge.student;
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <MotionSection id="home" className="scroll-mt-24">
      <div className="flex flex-col lg:flex-row lg:items-stretch">

        {/* Left — Hero with dark gradient (60%) */}
        <div className="bg-linear-to-br from-slate-900 via-blue-950 to-cyan-900 text-white lg:w-3/5 rounded-3xl ml-3">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14 lg:py-16 lg:pr-10">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
              Your academic hub — access resources, stay updated with blogs,
              and explore everything UniLink has to offer.
            </p>

            {/* Mini profile card */}
            <div className="mt-6 w-fit rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-black">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user?.fullName || "User"}</p>
                  <p className="truncate text-xs text-blue-300">{user?.email || ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Calendar on light bg (40%) */}
        <div className="border-b border-slate-200 bg-slate-50 lg:w-2/5 lg:border-b-0 lg:border-l">
          <div className="h-full px-4 py-6 sm:px-6 lg:px-5 lg:py-8">
            <UpcomingCalendar />
          </div>
        </div>

      </div>
    </MotionSection>
  );
};

export default HeroSection;
