import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import UserAvatar from "../components/common/UserAvatar";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    bg: "bg-sky-100",
    text: "text-sky-700",
    dot: "bg-sky-500",
    banner: "from-sky-400 via-blue-500 to-indigo-600",
  },
  faculty: {
    label: "Faculty",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    banner: "from-blue-500 via-indigo-500 to-violet-600",
  },
  admin: {
    label: "Administrator",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    banner: "from-emerald-400 via-teal-500 to-cyan-600",
  },
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300";

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const imgInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [imgError, setImgError] = useState("");
  const [form, setForm] = useState({ fullName: "", program: "", batch: "", department: "" });

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

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg(null);
    try {
      await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(form) });
      await refreshUser();
      setSaveMsg({ type: "success", text: "Profile updated successfully." });
      setIsEditing(false);
    } catch (err) {
      setSaveMsg({ type: "error", text: err.message });
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
    setSaveMsg(null);
  };

  const handleSendReset = async () => {
    setSendingReset(true);
    setResetMsg(null);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setResetMsg({ type: "success", text: "Reset link sent! Check your inbox." });
    } catch (err) {
      setResetMsg({ type: "error", text: err.message });
    } finally {
      setSendingReset(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImg(true);
    setImgError("");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await apiFetch("/auth/profile/image", { method: "POST", body: formData });
      await refreshUser();
    } catch (err) {
      setImgError(err.message);
    } finally {
      setIsUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await logout(); navigate("/login", { replace: true }); }
    finally { setIsLoggingOut(false); }
  };

  const role = user?.role || "student";
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const pageIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  return (
    <AppLayout activePage="profile" user={user} title="Profile" subtitle="Manage your account" icon={pageIcon}>
      <div className="mx-auto max-w-3xl space-y-5 pb-10">

        {/* ── Hero card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Banner */}
          <div className={`relative h-32 bg-gradient-to-br sm:h-40 ${rc.banner}`}>
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/8" />
            <div className="absolute left-10 top-6 h-14 w-14 rounded-full bg-white/5" />
            {!isEditing && (
              <button
                type="button"
                onClick={() => { setIsEditing(true); setSaveMsg(null); }}
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Avatar + status row */}
          <div className="px-5 sm:px-7">
            <div className="-mt-14 mb-4 flex items-end justify-between">

              {/* Avatar with camera overlay */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={isUploadingImg}
                  className="group relative block focus:outline-none"
                  title="Change profile photo"
                >
                  <UserAvatar
                    user={user}
                    className="h-28 w-28 rounded-xl border-2 border-white shadow-lg"
                    textSize="text-3xl"
                  />
                  <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 transition-opacity ${isUploadingImg ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    {isUploadingImg ? (
                      <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Active / Inactive pill */}
              <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${user?.isActive ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-600"}`}>
                <span className={`h-2 w-2 rounded-full ${user?.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                {user?.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Name / email / chips */}
            <div className="pb-6">
              {imgError && (
                <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{imgError}</p>
              )}
              <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{user?.fullName}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{user?.email}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${rc.bg} ${rc.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${rc.dot}`} />
                  {rc.label}
                </span>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                {user?.enrollmentNumber && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-600">
                    {user.enrollmentNumber}
                  </span>
                )}
                {user?.department && user?.role !== "student" && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {user.department}
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid gap-5 lg:grid-cols-5">

          {/* Left: Personal Information (3/5) */}
          <div className="space-y-5 lg:col-span-3">

            {saveMsg && (
              <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${saveMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {saveMsg.type === "success" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {saveMsg.text}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Personal Information</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Update your display name and academic details</p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => { setIsEditing(true); setSaveMsg(null); }}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</p>
                  {isEditing ? (
                    <input type="text" value={form.fullName} onChange={handleChange("fullName")} className={inputCls} placeholder="Your full name" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.fullName || "—"}</p>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{user?.email || "—"}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">Read only</span>
                  </div>
                </div>

                {user?.role === "student" && (
                  <>
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Program</p>
                      {isEditing ? (
                        <input type="text" value={form.program} onChange={handleChange("program")} className={inputCls} placeholder="e.g. BS Computer Science" />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800">{user?.program || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Batch</p>
                      {isEditing ? (
                        <input type="text" value={form.batch} onChange={handleChange("batch")} className={inputCls} placeholder="e.g. FA23" />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800">{user?.batch || "—"}</p>
                      )}
                    </div>
                  </>
                )}

                {(user?.role === "faculty" || user?.role === "admin") && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Department</p>
                    {isEditing ? (
                      <input type="text" value={form.department} onChange={handleChange("department")} className={inputCls} placeholder="e.g. Computer Science" />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{user?.department || "—"}</p>
                    )}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Saving…
                      </>
                    ) : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Account + Security + Sign Out (2/5) */}
          <div className="space-y-4 lg:col-span-2">

            {/* Account Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-sm font-black text-slate-900">Account Details</h3>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2.5 first:pt-0">
                  <span className="text-xs font-semibold text-slate-400">Role</span>
                  <span className="text-xs font-bold text-slate-700">{rc.label}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-xs font-semibold text-slate-400">Status</span>
                  <span className={`text-xs font-bold ${user?.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {user?.enrollmentNumber && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400">Enrollment</span>
                    <span className="font-mono text-xs font-bold tracking-tight text-slate-700">{user.enrollmentNumber}</span>
                  </div>
                )}
                {user?.currentSemester && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400">Semester</span>
                    <span className="text-xs font-bold text-slate-700">Semester {user.currentSemester}</span>
                  </div>
                )}
                {user?.program && user?.role === "student" && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400">Program</span>
                    <span className="max-w-[55%] truncate text-right text-xs font-bold text-slate-700">{user.program}</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 last:pb-0">
                  <span className="text-xs font-semibold text-slate-400">Joined</span>
                  <span className="text-xs font-bold text-slate-700">{joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-black text-slate-900">Security</h3>
              <p className="mb-4 mt-0.5 text-xs text-slate-400">Manage your password</p>

              {resetMsg && (
                <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${resetMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {resetMsg.type === "success" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {resetMsg.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendReset}
                disabled={sendingReset || resetMsg?.type === "success"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {sendingReset ? "Sending…" : "Send Password Reset Link"}
              </button>
              <p className="mt-2 text-center text-[10px] text-slate-400">A reset link will be emailed to you</p>
            </div>

            {/* Sign Out */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
              <h3 className="text-sm font-black text-slate-900">Sign Out</h3>
              <p className="mb-4 mt-0.5 text-xs text-slate-400">You'll be redirected to the login page.</p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isLoggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
