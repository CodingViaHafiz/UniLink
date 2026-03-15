import { Link } from "react-router-dom";
import { MotionSection } from "../../lib/motion";

const quickLinks = [
  {
    label: "Resources",
    description: "Notes, past papers & timetables",
    to: "/resources",
    bg: "bg-sky-50",
    text: "text-sky-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Blogs",
    description: "Faculty & admin insights",
    to: "/blogs",
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    label: "Hostels",
    description: "Verified accommodation listings",
    to: "/hostels",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Live Feed",
    description: "Real-time campus updates",
    to: "/home",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "Coming Soon",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const roleBadge = {
  student: { label: "Student", cls: "bg-sky-100 text-sky-700" },
  faculty: { label: "Faculty", cls: "bg-blue-100 text-blue-700" },
  admin: { label: "Administrator", cls: "bg-emerald-100 text-emerald-700" },
};

const HeroSection = ({ user }) => {
  const badge = roleBadge[user?.role] || roleBadge.student;
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <>
      {/* Welcome Banner */}
      <MotionSection
        id="home"
        className="scroll-mt-24 border-b border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 text-white"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
                {badge.label}
              </span>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Your academic hub — access resources, stay updated with blogs,
                and explore everything UniLink has to offer.
              </p>
            </div>

            {/* Mini profile card */}
            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-base font-black sm:h-12 sm:w-12 sm:text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user?.fullName || "User"}</p>
                  <p className="truncate text-xs text-blue-200">{user?.email || ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Quick Access Cards */}
      <MotionSection className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-7 grid grid-cols-2 gap-3 sm:-mt-9 sm:gap-4 lg:grid-cols-4">
          {quickLinks.map((item) => {
            const isDisabled = !!item.badge;
            const Wrapper = isDisabled ? "div" : Link;
            const wrapperProps = isDisabled ? {} : { to: item.to };

            return (
              <Wrapper
                key={item.label}
                {...wrapperProps}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all sm:p-5 ${
                  isDisabled
                    ? "cursor-default opacity-70"
                    : "hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                {item.badge && (
                  <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    {item.badge}
                  </span>
                )}
                <div className={`inline-flex rounded-xl p-2.5 ${item.bg} ${item.text}`}>
                  {item.icon}
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 sm:text-base">
                  {item.label}
                </h3>
                <p className="mt-1 hidden text-xs text-slate-500 sm:block sm:text-sm">
                  {item.description}
                </p>
              </Wrapper>
            );
          })}
        </div>
      </MotionSection>
    </>
  );
};

export default HeroSection;
