import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const formatCredits = (theory, lab) => (lab > 0 ? `${theory}+${lab}` : `${theory}`);
const courseCredits = (c) => (c.theoryCredits || 0) + (c.labCredits || 0);

const calcTotalCredits = (program) =>
  (program.semesters || []).flatMap((s) => s.courses || []).reduce((n, c) => n + courseCredits(c), 0);

const calcTotalCourses = (program) =>
  (program.semesters || []).reduce((n, s) => n + (s.courses || []).length, 0);

const sortCourses = (courses) =>
  [...courses].sort((a, b) => {
    if (a.type === "core" && b.type !== "core") return -1;
    if (a.type !== "core" && b.type === "core") return 1;
    return (a.order || 0) - (b.order || 0);
  });

/* Group semesters into pairs per academic year */
const groupByYear = (semesters) => {
  const years = {};
  [...semesters].sort((a, b) => a.number - b.number).forEach((sem) => {
    const yr = Math.ceil(sem.number / 2);
    if (!years[yr]) years[yr] = [];
    years[yr].push(sem);
  });
  return years;
};

/* ── Type badge ───────────────────────────────────────────────────────────── */

const TypeBadge = ({ type }) => {
  const isCore = type === "core";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      isCore ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
    }`}>
      <span className={`h-1 w-1 rounded-full ${isCore ? "bg-sky-500" : "bg-amber-500"}`} />
      {isCore ? "Core" : "Elective"}
    </span>
  );
};

/* ── Desktop course row ───────────────────────────────────────────────────── */

const CourseRow = ({ course, index }) => (
  <tr className="group border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/70">
    <td className="relative py-3.5 pl-5 pr-4 w-4">
      <span className={`absolute left-0 top-1/2 h-8 w-0.75 -translate-y-1/2 rounded-r-full ${
        course.type === "core" ? "bg-sky-400" : "bg-amber-400"
      }`} />
      <span className="font-mono text-[11px] font-bold text-slate-400">{course.courseCode}</span>
    </td>
    <td className="py-3.5 pr-4 text-sm font-semibold text-slate-800">{course.courseName}</td>
    <td className="py-3.5 pr-4 text-center whitespace-nowrap">
      <span className="inline-flex items-baseline gap-0.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 tabular-nums">
        {formatCredits(course.theoryCredits, course.labCredits)}
        <span className="text-[9px] font-medium text-slate-400">hrs</span>
      </span>
    </td>
    <td className="py-3.5 pr-4">
      <TypeBadge type={course.type} />
    </td>
  </tr>
);

/* ── Mobile course card ───────────────────────────────────────────────────── */

const CourseCard = ({ course }) => (
  <div className={`rounded-xl border-l-4 bg-white px-3.5 py-3 shadow-sm ${
    course.type === "core" ? "border-sky-400" : "border-amber-400"
  }`}>
    <div className="flex items-start justify-between gap-2">
      <span className="font-mono text-[11px] font-bold text-slate-400">{course.courseCode}</span>
      <TypeBadge type={course.type} />
    </div>
    <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-800">{course.courseName}</p>
    <div className="mt-2 flex items-center gap-1">
      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600 tabular-nums">
        {formatCredits(course.theoryCredits, course.labCredits)} hrs
      </span>
    </div>
  </div>
);

/* ── Semester accordion ───────────────────────────────────────────────────── */

const SEMESTER_COLORS = [
  "from-sky-400 to-blue-500",
  "from-blue-400 to-indigo-500",
  "from-indigo-400 to-violet-500",
  "from-violet-400 to-purple-500",
  "from-purple-400 to-fuchsia-500",
  "from-fuchsia-400 to-pink-500",
  "from-pink-400 to-rose-500",
  "from-rose-400 to-red-500",
  "from-amber-400 to-orange-500",
  "from-orange-400 to-red-500",
  "from-teal-400 to-cyan-500",
  "from-cyan-400 to-sky-500",
];

const SemesterCard = ({ semester, isOpen, onToggle, isCurrentSemester }) => {
  const sorted = useMemo(() => sortCourses(semester.courses || []), [semester.courses]);
  const semCredits = sorted.reduce((sum, c) => sum + courseCredits(c), 0);
  const colorClass = SEMESTER_COLORS[(semester.number - 1) % SEMESTER_COLORS.length];

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow ${
      isOpen ? "border-sky-200 shadow-sky-100/60" : "border-slate-200 hover:border-slate-300"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
      >
        <div className="flex items-center gap-4">
          {/* Gradient number badge */}
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-black text-white shadow-md ${colorClass}`}>
            {semester.number}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900">Semester {semester.number}</h3>
              {isCurrentSemester && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  You are here
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
              {sorted.length} {sorted.length === 1 ? "course" : "courses"} &middot; {semCredits} credit hrs
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 tabular-nums sm:inline-flex">
            {semCredits} hrs
          </span>
          <div className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
            isOpen ? "border-sky-200 bg-sky-50 text-sky-500" : "border-slate-200 bg-white text-slate-400"
          }`}>
            <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Collapsible body — smooth height animation via CSS grid trick */}
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100">
            {sorted.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-400">No courses added yet</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="py-2.5 pl-5 pr-4 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          Code
                        </th>
                        <th className="py-2.5 pr-4 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          Course Name
                        </th>
                        <th className="py-2.5 pr-4 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          Credits
                        </th>
                        <th className="py-2.5 pr-4 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((c, i) => <CourseRow key={c.id} course={c} index={i} />)}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-2.5 p-4 md:hidden">
                  {sorted.map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Elective pool ────────────────────────────────────────────────────────── */

const ElectivePool = ({ electives }) => {
  if (!electives || electives.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">Elective Pool</h3>
          <p className="text-[11px] font-semibold text-slate-400">
            {electives.length} {electives.length === 1 ? "option" : "options"} available to choose from
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {electives.map((e) => (
          <div
            key={e.id}
            className="group rounded-2xl border border-violet-200/70 bg-white p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-lg bg-violet-100 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700">
                {e.courseCode}
              </span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-black text-violet-600 tabular-nums">
                {courseCredits(e)} hrs
              </span>
            </div>
            <p className="mt-2.5 text-sm font-semibold leading-snug text-slate-800">{e.courseName}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Loading skeleton ─────────────────────────────────────────────────────── */

const LoadingSkeleton = () => (
  <div className="space-y-5">
    {/* Program selector skeleton */}
    <div className="flex gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 w-32 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
    {/* Hero skeleton */}
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-6 w-16 rounded-xl bg-slate-200" />
        <div className="h-7 w-56 rounded-xl bg-slate-200" />
      </div>
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 w-24 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
    {/* Semester skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-lg bg-slate-200" />
            <div className="h-3 w-40 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ── Page ─────────────────────────────────────────────────────────────────── */

const programsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422A12.083 12.083 0 0121 12.75c0 2.278-4.03 4.25-9 4.25s-9-1.972-9-4.25c0-.691.54-1.344 1.48-1.922L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14v7.5" />
  </svg>
);

const ProgramsPage = () => {
  const { user } = useAuth();

  const [programs, setPrograms]           = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState("");
  const [selectedId, setSelectedId]       = useState(null);
  const [openSemesters, setOpenSemesters] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/programs", { method: "GET" });
        const list = data.programs || [];
        setPrograms(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          const firstSem = list[0].semesters?.[0];
          if (firstSem) setOpenSemesters({ [firstSem.number]: true });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const selected = useMemo(
    () => programs.find((p) => p.id === selectedId) || null,
    [programs, selectedId]
  );

  const totalCredits = useMemo(() => (selected ? calcTotalCredits(selected) : 0), [selected]);
  const totalCourses = useMemo(() => (selected ? calcTotalCourses(selected) : 0), [selected]);

  const yearGroups = useMemo(
    () => (selected ? groupByYear(selected.semesters || []) : {}),
    [selected]
  );

  const handleSelectProgram = (id) => {
    setSelectedId(id);
    const prog = programs.find((p) => p.id === id);
    const firstSem = prog?.semesters?.[0];
    setOpenSemesters(firstSem ? { [firstSem.number]: true } : {});
  };

  const toggleSemester = (num) =>
    setOpenSemesters((prev) => ({ ...prev, [num]: !prev[num] }));

  const expandAll = () => {
    const all = {};
    (selected?.semesters || []).forEach((s) => { all[s.number] = true; });
    setOpenSemesters(all);
  };

  const collapseAll = () => setOpenSemesters({});

  const isEnrolledInProgram =
    user?.program &&
    selected &&
    (user.program.toLowerCase() === selected.code.toLowerCase() ||
      user.program.toLowerCase() === selected.name.toLowerCase());

  const subtitle = isLoading
    ? "Loading…"
    : programs.length === 0
    ? "No programs"
    : `${programs.length} ${programs.length === 1 ? "program" : "programs"}`;

  return (
    <AppLayout activePage="programs" user={user} title="Programs" subtitle={subtitle} icon={programsIcon}>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && programs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-24 text-center">
          <div className="mb-4 rounded-2xl bg-slate-50 p-5 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7.5" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">No programs available yet</p>
          <p className="mt-1 text-xs text-slate-400">Programs will appear here once they are added.</p>
        </div>
      )}

      {!isLoading && !error && programs.length > 0 && selected && (
        <div className="space-y-5">

          {/* ── 1. Program selector ─────────────────────────────────────────── */}
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {programs.map((p) => {
              const isActive = selected.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProgram(p.id)}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-left transition-all duration-150 ${
                    isActive
                      ? "bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/70"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:shadow-sm"
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-sky-100" : "text-sky-600"}`}>
                    {p.code}
                  </p>
                  <p className={`mt-0.5 max-w-27.5 truncate text-[11px] font-semibold ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                    {p.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ── 2. Program hero ─────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 via-white to-blue-50 p-6 shadow-sm">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-100/50" />
            <div className="pointer-events-none absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-blue-100/40" />

            <div className="relative">
              {/* Title row */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-xl bg-sky-600 px-3 py-1 text-xs font-black tracking-wide text-white">
                  {selected.code}
                </span>
                {isEnrolledInProgram && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Your Program
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{selected.name}</h2>

              {/* Stats */}
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { value: totalCredits, label: "Credit Hours",   color: "text-sky-600",    bg: "bg-white border-sky-100" },
                  { value: selected.totalSemesters, label: "Semesters", color: "text-blue-600",   bg: "bg-white border-blue-100" },
                  { value: totalCourses, label: "Total Courses",  color: "text-indigo-600", bg: "bg-white border-indigo-100" },
                  { value: Math.ceil(selected.totalSemesters / 2), label: "Years",           color: "text-violet-600", bg: "bg-white border-violet-100" },
                ].map(({ value, label, color, bg }) => (
                  <div key={label} className={`rounded-xl border px-4 py-3 text-center shadow-sm ${bg}`}>
                    <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3. Semester controls ────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            {/* Quick jump buttons */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {(selected.semesters || [])
                .sort((a, b) => a.number - b.number)
                .map((sem) => {
                  const isOpen = !!openSemesters[sem.number];
                  const isCurrent = user?.currentSemester === sem.number && isEnrolledInProgram;
                  return (
                    <button
                      key={sem.number}
                      type="button"
                      title={`Semester ${sem.number}`}
                      onClick={() => toggleSemester(sem.number)}
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all ${
                        isOpen
                          ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
                          : "bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                      }`}
                    >
                      {sem.number}
                      {isCurrent && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Expand / collapse all */}
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* ── 4. Year-grouped semester accordions ─────────────────────────── */}
          <div className="space-y-6">
            {Object.entries(yearGroups).map(([year, sems]) => (
              <div key={year}>
                {/* Year divider */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[10px] font-black text-white">
                      {year}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Year {year}
                    </span>
                  </div>
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-[10px] font-semibold text-slate-400">
                    {sems.reduce((n, s) => n + (s.courses || []).length, 0)} courses
                  </span>
                </div>

                <div className="space-y-3">
                  {sems.map((sem) => (
                    <SemesterCard
                      key={sem.number}
                      semester={sem}
                      isOpen={!!openSemesters[sem.number]}
                      onToggle={() => toggleSemester(sem.number)}
                      isCurrentSemester={user?.currentSemester === sem.number && isEnrolledInProgram}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── 5. Elective pool ────────────────────────────────────────────── */}
          <ElectivePool electives={selected.electivePool} />

        </div>
      )}
    </AppLayout>
  );
};

export default ProgramsPage;
