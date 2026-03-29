import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

const emptyCourse = { courseName: "", courseCode: "", theoryCredits: 3, labCredits: 0, type: "core", order: 0 };
const emptyElective = { courseName: "", courseCode: "", theoryCredits: 3, labCredits: 0 };

const AdminProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Program form
  const [form, setForm] = useState({ name: "", code: "", totalSemesters: "" });
  const [editingId, setEditingId] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  // Semester & elective editing
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeSemester, setActiveSemester] = useState(1);
  const [semesterCourses, setSemesterCourses] = useState([]);
  const [electives, setElectives] = useState([]);
  const [savingSemester, setSavingSemester] = useState(false);
  const [savingElectives, setSavingElectives] = useState(false);
  const [semFeedback, setSemFeedback] = useState({ type: "", text: "" });
  const [elecFeedback, setElecFeedback] = useState({ type: "", text: "" });

  const flash = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter({ type: "", text: "" }), 4000);
  };

  // ── Load ──────────────────────────────────────────────────────
  const loadPrograms = async () => {
    const data = await apiFetch("/programs", { method: "GET" });
    setPrograms(data.programs || []);
  };

  useEffect(() => {
    (async () => {
      try { setIsLoading(true); await loadPrograms(); }
      catch (e) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // ── Refresh selected program after any update ─────────────────
  const refreshSelected = (updatedProgram) => {
    setSelectedProgram(updatedProgram);
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
    // Reload current semester courses from the updated data
    const sem = updatedProgram.semesters?.find((s) => s.number === activeSemester);
    setSemesterCourses(sem?.courses?.length ? sem.courses.map((c) => ({ ...c })) : []);
    setElectives(updatedProgram.electivePool?.length ? updatedProgram.electivePool.map((e) => ({ ...e })) : []);
  };

  // ── Program CRUD ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try {
      const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), totalSemesters: Number(form.totalSemesters) };
      if (editingId) {
        const res = await apiFetch(`/programs/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        const updated = res.program || res;
        setPrograms((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        if (selectedProgram?.id === editingId) refreshSelected(updated);
        flash(setFeedback, "success", `"${updated.name}" updated successfully.`);
      } else {
        const res = await apiFetch("/programs", { method: "POST", body: JSON.stringify(payload) });
        const created = res.program || res;
        setPrograms((prev) => [created, ...prev]);
        flash(setFeedback, "success", `"${created.name}" created! Click Manage to add courses.`);
      }
      setForm({ name: "", code: "", totalSemesters: "" });
      setEditingId(null);
    } catch (err) {
      flash(setFeedback, "error", err.message);
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async (program) => {
    try {
      await apiFetch(`/programs/${program.id}`, { method: "DELETE" });
      setPrograms((prev) => prev.filter((p) => p.id !== program.id));
      if (selectedProgram?.id === program.id) { setSelectedProgram(null); setSemesterCourses([]); setElectives([]); }
      if (editingId === program.id) { setEditingId(null); setForm({ name: "", code: "", totalSemesters: "" }); }
      flash(setFeedback, "success", `"${program.name}" deleted.`);
    } catch (err) { flash(setFeedback, "error", err.message); }
  };

  // ── Select program for managing ──────────────────────────────
  const selectProgram = (program) => {
    setSelectedProgram(program);
    setActiveSemester(1);
    const sem1 = program.semesters?.find((s) => s.number === 1);
    setSemesterCourses(sem1?.courses?.length ? sem1.courses.map((c) => ({ ...c })) : []);
    setElectives(program.electivePool?.length ? program.electivePool.map((e) => ({ ...e })) : []);
    setSemFeedback({ type: "", text: "" });
    setElecFeedback({ type: "", text: "" });
  };

  const switchSemester = (num) => {
    setActiveSemester(num);
    const sem = selectedProgram.semesters?.find((s) => s.number === num);
    setSemesterCourses(sem?.courses?.length ? sem.courses.map((c) => ({ ...c })) : []);
    setSemFeedback({ type: "", text: "" });
  };

  // ── Course helpers ────────────────────────────────────────────
  const updateCourse = (i, field, value) => setSemesterCourses((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const removeCourse = (i) => setSemesterCourses((prev) => prev.filter((_, idx) => idx !== i));
  const addCourse = () => setSemesterCourses((prev) => [...prev, { ...emptyCourse, order: prev.length }]);

  const saveSemester = async () => {
    setSavingSemester(true);
    try {
      const res = await apiFetch(`/programs/${selectedProgram.id}/semesters/${activeSemester}`, {
        method: "PUT", body: JSON.stringify({ courses: semesterCourses }),
      });
      refreshSelected(res.program || res);
      flash(setSemFeedback, "success", `Semester ${activeSemester} saved — ${semesterCourses.length} course(s).`);
    } catch (err) { flash(setSemFeedback, "error", err.message); }
    finally { setSavingSemester(false); }
  };

  // ── Elective helpers ──────────────────────────────────────────
  const updateElective = (i, field, value) => setElectives((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  const removeElective = (i) => setElectives((prev) => prev.filter((_, idx) => idx !== i));
  const addElective = () => setElectives((prev) => [...prev, { ...emptyElective }]);

  const saveElectives = async () => {
    setSavingElectives(true);
    try {
      const res = await apiFetch(`/programs/${selectedProgram.id}/electives`, {
        method: "PUT", body: JSON.stringify({ electives }),
      });
      refreshSelected(res.program || res);
      flash(setElecFeedback, "success", `${electives.length} elective(s) saved.`);
    } catch (err) { flash(setElecFeedback, "error", err.message); }
    finally { setSavingElectives(false); }
  };

  // ── Count helpers for program cards ───────────────────────────
  const getCourseCount = (program) => program.semesters?.reduce((sum, s) => sum + (s.courses?.length || 0), 0) || 0;
  const getTotalCredits = (program) => program.semesters?.reduce((sum, s) => sum + (s.courses?.reduce((cs, c) => cs + (c.theoryCredits || 0) + (c.labCredits || 0), 0) || 0), 0) || 0;

  // ── Feedback banner component ─────────────────────────────────
  const Banner = ({ fb }) => fb.text ? (
    <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${fb.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {fb.text}
    </div>
  ) : null;

  return (
    <MotionPage className="space-y-6">

      {/* ═══════════════════ CREATE / EDIT PROGRAM ═══════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Program Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          {editingId ? "Editing program details — update and save." : "Add a new academic program, then click Manage to build its syllabus."}
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Program Name</label>
              <input type="text" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Bachelor of Computer Science" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Program Code</label>
              <input type="text" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase" placeholder="e.g. BCS" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Semesters</label>
              <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. 8" min={1} max={12} value={form.totalSemesters} onChange={(e) => setForm((p) => ({ ...p, totalSemesters: e.target.value }))} required />
            </div>
          </div>

          <Banner fb={feedback} />

          <div className="flex gap-2">
            <button type="submit" disabled={formBusy} className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              {formBusy ? "Saving..." : editingId ? "Update Program" : "Add Program"}
            </button>
            {editingId && (
              <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600" onClick={() => { setEditingId(null); setForm({ name: "", code: "", totalSemesters: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ═══════════════════ PROGRAM LIST ════════════════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">All Programs</h2>

        {isLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading programs...</p>}
        {!isLoading && error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        {!isLoading && !error && programs.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 py-10 text-center">
            <p className="text-sm font-bold text-slate-500">No programs created yet</p>
            <p className="mt-1 text-xs text-slate-400">Use the form above to add your first program.</p>
          </div>
        )}

        {!isLoading && !error && programs.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const isSelected = selectedProgram?.id === program.id;
              return (
                <div key={program.id} className={`rounded-xl border p-4 transition-all ${isSelected ? "border-sky-400 bg-sky-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{program.name}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">{program.code} · {program.totalSemesters} semesters</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {getCourseCount(program)} courses · {getTotalCredits(program)} cr
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => selectProgram(program)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${isSelected ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-700"}`}>
                      {isSelected ? "Managing" : "Manage"}
                    </button>
                    <button type="button" onClick={() => { setEditingId(program.id); setForm({ name: program.name, code: program.code, totalSemesters: program.totalSemesters }); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(program)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════ SEMESTER COURSES ════════════════════ */}
      {selectedProgram && (
        <section className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900">{selectedProgram.name} — Syllabus</h2>
              <p className="mt-0.5 text-xs text-slate-500">Select a semester, add courses, then save. Repeat for each semester.</p>
            </div>
            <button type="button" onClick={() => { setSelectedProgram(null); setSemesterCourses([]); setElectives([]); }} className="text-xs font-bold text-slate-400 hover:text-slate-600">
              Close
            </button>
          </div>

          {/* Semester tabs */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from({ length: selectedProgram.totalSemesters }, (_, i) => i + 1).map((num) => {
              const sem = selectedProgram.semesters?.find((s) => s.number === num);
              const count = sem?.courses?.length || 0;
              return (
                <button key={num} type="button" onClick={() => switchSemester(num)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeSemester === num ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  Sem {num} {count > 0 && <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[9px]">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Course rows */}
          <div className="mt-4 space-y-2">
            {semesterCourses.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center">
                <p className="text-sm text-slate-500">No courses in Semester {activeSemester} yet.</p>
                <p className="mt-0.5 text-xs text-slate-400">Click "Add Course" below to start building.</p>
              </div>
            )}

            {/* Header row on desktop */}
            {semesterCourses.length > 0 && (
              <div className="hidden gap-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-12">
                <span className="col-span-4">Course Name</span>
                <span className="col-span-2">Code</span>
                <span className="col-span-1">Theory</span>
                <span className="col-span-1">Lab</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-2"></span>
              </div>
            )}

            {semesterCourses.map((course, idx) => (
              <div key={idx} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12 sm:items-center">
                <input type="text" className="col-span-4 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm" placeholder="e.g. Data Structures" value={course.courseName} onChange={(e) => updateCourse(idx, "courseName", e.target.value)} />
                <input type="text" className="col-span-2 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm uppercase" placeholder="CS-301" value={course.courseCode} onChange={(e) => updateCourse(idx, "courseCode", e.target.value)} />
                <input type="number" className="col-span-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm" min={0} max={6} value={course.theoryCredits} onChange={(e) => updateCourse(idx, "theoryCredits", Number(e.target.value))} />
                <input type="number" className="col-span-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm" min={0} max={3} value={course.labCredits} onChange={(e) => updateCourse(idx, "labCredits", Number(e.target.value))} />
                <select className="col-span-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" value={course.type} onChange={(e) => updateCourse(idx, "type", e.target.value)}>
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                </select>
                <div className="col-span-2 flex justify-end gap-1.5">
                  {idx > 0 && (
                    <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-400" onClick={() => { const arr = [...semesterCourses]; [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; setSemesterCourses(arr); }}>↑</button>
                  )}
                  {idx < semesterCourses.length - 1 && (
                    <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-400" onClick={() => { const arr = [...semesterCourses]; [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; setSemesterCourses(arr); }}>↓</button>
                  )}
                  <button type="button" className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-600" onClick={() => removeCourse(idx)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <Banner fb={semFeedback} />

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={addCourse} className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:border-sky-300 hover:text-sky-600">
              + Add Course
            </button>
            <button type="button" onClick={saveSemester} disabled={savingSemester} className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              {savingSemester ? "Saving..." : `Save Semester ${activeSemester}`}
            </button>
          </div>

          {/* ═══════════════════ ELECTIVE POOL ═════════════════════ */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-black text-slate-900">Elective Pool — {selectedProgram.code}</h3>
            <p className="mt-0.5 text-xs text-slate-500">These are the actual elective subjects students can choose from when they have an elective slot.</p>

            <div className="mt-4 space-y-2">
              {electives.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-4 text-center">
                  <p className="text-sm text-slate-500">No electives added yet.</p>
                </div>
              )}

              {electives.length > 0 && (
                <div className="hidden gap-2 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-10">
                  <span className="col-span-4">Elective Name</span>
                  <span className="col-span-2">Code</span>
                  <span className="col-span-1">Theory</span>
                  <span className="col-span-1">Lab</span>
                  <span className="col-span-2"></span>
                </div>
              )}

              {electives.map((elective, idx) => (
                <div key={idx} className="grid gap-2 rounded-xl border border-violet-200 bg-violet-50/50 p-3 sm:grid-cols-10 sm:items-center">
                  <input type="text" className="col-span-4 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm" placeholder="e.g. Artificial Intelligence" value={elective.courseName} onChange={(e) => updateElective(idx, "courseName", e.target.value)} />
                  <input type="text" className="col-span-2 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm uppercase" placeholder="CS-E01" value={elective.courseCode} onChange={(e) => updateElective(idx, "courseCode", e.target.value)} />
                  <input type="number" className="col-span-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm" min={0} max={6} value={elective.theoryCredits} onChange={(e) => updateElective(idx, "theoryCredits", Number(e.target.value))} />
                  <input type="number" className="col-span-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm" min={0} max={3} value={elective.labCredits} onChange={(e) => updateElective(idx, "labCredits", Number(e.target.value))} />
                  <div className="col-span-2 flex justify-end">
                    <button type="button" className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-600" onClick={() => removeElective(idx)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <Banner fb={elecFeedback} />

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={addElective} className="rounded-xl border border-dashed border-violet-300 px-4 py-2 text-sm font-bold text-violet-500 transition-colors hover:border-violet-400 hover:text-violet-600">
                + Add Elective
              </button>
              <button type="button" onClick={saveElectives} disabled={savingElectives} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                {savingElectives ? "Saving..." : "Save Electives"}
              </button>
            </div>
          </div>
        </section>
      )}
    </MotionPage>
  );
};

export default AdminProgramsPage;
