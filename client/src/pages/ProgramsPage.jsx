import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

/* ─────────────────────────────────────────
   Icons
───────────────────────────────────────── */

const programsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422A12.083 12.083 0 0121 12.75c0 2.278-4.03 4.25-9 4.25s-9-1.972-9-4.25c0-.691.54-1.344 1.48-1.922L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14v7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12v4.5" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

/** Format credits as "theory+lab" or just "theory" when lab is 0 */
const formatCredits = (theory, lab) =>
  lab > 0 ? `${theory}+${lab}` : `${theory}`;

/** Total credits for a single course */
const courseCredits = (c) => (c.theoryCredits || 0) + (c.labCredits || 0);

/** Calculate total credit hours across all semesters */
const calcTotalCredits = (program) => {
  let total = 0;
  (program.semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((c) => {
      total += courseCredits(c);
    });
  });
  return total;
};

/** Sort courses: core first, then elective, then by order */
const sortCourses = (courses) =>
  [...courses].sort((a, b) => {
    if (a.type === "core" && b.type !== "core") return -1;
    if (a.type !== "core" && b.type === "core") return 1;
    return (a.order || 0) - (b.order || 0);
  });

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const TypeBadge = ({ type }) => {
  const isCore = type === "core";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        isCore
          ? "bg-slate-100 text-slate-600"
          : "border border-dashed border-amber-300 bg-amber-50 text-amber-700"
      }`}
    >
      {isCore ? "Core" : "Elective"}
    </span>
  );
};

/** Desktop table row */
const CourseRow = ({ course }) => (
  <tr className="border-b border-slate-100 last:border-0">
    <td className="py-3 pr-4 pl-4 text-xs font-bold text-slate-500 whitespace-nowrap">
      {course.courseCode}
    </td>
    <td className="py-3 pr-4 text-sm font-semibold text-slate-900">
      {course.courseName}
    </td>
    <td className="py-3 pr-4 text-center text-sm font-bold tabular-nums text-slate-700 whitespace-nowrap">
      {formatCredits(course.theoryCredits, course.labCredits)}
    </td>
    <td className="py-3 pr-4">
      <TypeBadge type={course.type} />
    </td>
  </tr>
);

/** Mobile card */
const CourseCard = ({ course }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-slate-400">{course.courseCode}</span>
      <TypeBadge type={course.type} />
    </div>
    <p className="text-sm font-semibold text-slate-900 leading-snug">{course.courseName}</p>
    <div className="flex items-center gap-1 text-xs text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-bold tabular-nums">
        {formatCredits(course.theoryCredits, course.labCredits)} credits
      </span>
    </div>
  </div>
);

/** Semester accordion card */
const SemesterCard = ({ semester, isOpen, onToggle }) => {
  const sorted = useMemo(() => sortCourses(semester.courses || []), [semester.courses]);
  const semCredits = sorted.reduce((sum, c) => sum + courseCredits(c), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-xs font-black text-sky-600">
            {semester.number}
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-900">Semester {semester.number}</h3>
            <p className="mt-0.5 text-[11px] text-slate-400 font-semibold">
              {sorted.length} {sorted.length === 1 ? "course" : "courses"} &middot; {semCredits} credit hrs
            </p>
          </div>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Body — collapsible */}
      {isOpen && (
        <div className="border-t border-slate-100">
          {sorted.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-semibold text-slate-400">No courses added yet</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="py-2.5 pl-4 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Code
                      </th>
                      <th className="py-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Course Name
                      </th>
                      <th className="py-2.5 pr-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Credits
                      </th>
                      <th className="py-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c) => (
                      <CourseRow key={c.id} course={c} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-2.5 p-4 md:hidden">
                {sorted.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Elective pool section */
const ElectivePool = ({ electives }) => {
  if (!electives || electives.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900">Available Electives</h3>
          <p className="text-[11px] font-semibold text-slate-400">
            {electives.length} elective {electives.length === 1 ? "option" : "options"} available
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {electives.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-violet-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-[11px] font-bold text-violet-400">{e.courseCode}</span>
              <p className="mt-1 text-sm font-semibold text-slate-900 leading-snug">{e.courseName}</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-bold text-violet-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {e.theoryCredits}+{e.labCredits} credits
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────── */

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Program pills skeleton */}
    <div className="flex gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-slate-200" />
      ))}
    </div>

    {/* Header skeleton */}
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="h-5 w-48 rounded-lg bg-slate-200" />
      <div className="flex gap-6">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-3 w-28 rounded-full bg-slate-200" />
      </div>
    </div>

    {/* Semester card skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded-lg bg-slate-200" />
            <div className="h-3 w-36 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */

const ProgramsPage = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [openSemesters, setOpenSemesters] = useState({});

  /* Fetch programs */
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
          // Open the first semester by default
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

  const totalCredits = useMemo(
    () => (selected ? calcTotalCredits(selected) : 0),
    [selected]
  );

  const handleSelectProgram = (id) => {
    setSelectedId(id);
    setOpenSemesters({});
    // Auto-open first semester of new program
    const prog = programs.find((p) => p.id === id);
    const firstSem = prog?.semesters?.[0];
    if (firstSem) setOpenSemesters({ [firstSem.number]: true });
  };

  const toggleSemester = (num) => {
    setOpenSemesters((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const subtitle = isLoading
    ? "Loading..."
    : programs.length === 0
      ? "No programs"
      : `${programs.length} ${programs.length === 1 ? "program" : "programs"}`;

  return (
    <AppLayout
      activePage="programs"
      user={user}
      title="Programs"
      subtitle={subtitle}
      icon={programsIcon}
    >
      {/* Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Empty — no programs */}
      {!isLoading && !error && programs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 rounded-2xl bg-slate-50 p-5 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7.5" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">No programs available yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Programs and their curricula will appear here once they are added.
          </p>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && programs.length > 0 && selected && (
        <div className="space-y-6">

          {/* ── Program selector pills ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {programs.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProgram(p.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  selected.id === p.id
                    ? "bg-sky-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>

          {/* ── Program header card ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">{selected.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="font-semibold">Code:</span>
                <span className="font-bold text-slate-700">{selected.code}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Semesters:</span>
                <span className="font-bold text-slate-700">{selected.totalSemesters}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Total Credits:</span>
                <span className="font-bold text-slate-700">{totalCredits}</span>
              </span>
            </div>
          </div>

          {/* ── Semester accordions ── */}
          <div className="space-y-3">
            {(selected.semesters || [])
              .sort((a, b) => a.number - b.number)
              .map((sem) => (
                <SemesterCard
                  key={sem.number}
                  semester={sem}
                  isOpen={!!openSemesters[sem.number]}
                  onToggle={() => toggleSemester(sem.number)}
                />
              ))}
          </div>

          {/* ── Elective pool ── */}
          <ElectivePool electives={selected.electivePool} />
        </div>
      )}
    </AppLayout>
  );
};

export default ProgramsPage;
