import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ROLE_COLORS = {
  student: "bg-sky-100 text-sky-700",
  faculty: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    fullName: "",
    program: "",
    batch: "",
    department: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        program: user.program || "",
        batch: user.batch || "",
        department: user.department || "",
      });
    }
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await logout(); navigate("/login", { replace: true }); }
    finally { setIsLoggingOut(false); }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(form) });
      await refreshUser();
      setMessage({ type: "success", text: "Profile updated." });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: user.fullName || "",
      program: user.program || "",
      batch: user.batch || "",
      department: user.department || "",
    });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-sky-300 focus:bg-white";

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <AppLayout activePage="profile" user={user} title="Profile" subtitle="Your account" icon={icon}>
      <div className="max-w-xl">

        {/* Message */}
        {message.text && (
          <div className={`mb-5 rounded-xl px-4 py-2.5 text-xs font-semibold ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          {/* Banner + Avatar */}
          <div className="relative h-20 bg-linear-to-br from-sky-400 via-blue-500 to-indigo-500">
            <div className="absolute -bottom-8 left-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-white bg-sky-100 text-xl font-black text-sky-700 shadow-md">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-press absolute right-3 bottom-2 rounded-lg bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Identity */}
          <div className="px-5 pt-11">
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${ROLE_COLORS[user?.role] || "bg-slate-100 text-slate-600"}`}>
                {user?.role}
              </span>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              {user?.enrollmentNumber && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{user.enrollmentNumber}</span>
              )}
              {joinedDate && (
                <span className="text-[10px] text-slate-400">Joined {joinedDate}</span>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid gap-3 border-t border-slate-100 px-5 py-4 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
              {isEditing ? (
                <input type="text" value={form.fullName} onChange={handleChange("fullName")} className={inputClass} />
              ) : (
                <p className="text-sm font-medium text-slate-700">{user?.fullName || "—"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</label>
              <p className="text-sm font-medium text-slate-700">{user?.email || "—"}</p>
            </div>

            {/* Student fields */}
            {user?.role === "student" && (
              <>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Program</label>
                  {isEditing ? (
                    <input type="text" value={form.program} onChange={handleChange("program")} placeholder="e.g. BS Computer Science" className={inputClass} />
                  ) : (
                    <p className="text-sm font-medium text-slate-700">{user?.program || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Batch</label>
                  {isEditing ? (
                    <input type="text" value={form.batch} onChange={handleChange("batch")} placeholder="e.g. FA23" className={inputClass} />
                  ) : (
                    <p className="text-sm font-medium text-slate-700">{user?.batch || "—"}</p>
                  )}
                </div>
              </>
            )}

            {/* Faculty / Admin */}
            {(user?.role === "faculty" || user?.role === "admin") && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Department</label>
                {isEditing ? (
                  <input type="text" value={form.department} onChange={handleChange("department")} placeholder="e.g. Computer Science" className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-slate-700">{user?.department || "—"}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</label>
              <p className="text-sm font-medium capitalize text-slate-700">{user?.role || "—"}</p>
            </div>
          </div>

          {/* Save / Cancel */}
          {isEditing && (
            <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-press rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="btn-press rounded-xl px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-press border bg-rose-50 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? "Logging out..." : "Sign out"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
