import { useState } from "react";
import { API_BASE } from "../../lib/api";
import { notifyError, notifySuccess } from "../../lib/toast";

const resourceOptions = [
  { value: "notes", label: "Notes" },
  { value: "past-papers", label: "Past Papers" },
  { value: "timetable", label: "Timetable" },
];

const ResourceUpload = ({ defaultType = "notes", onSuccess }) => {
  const [form, setForm] = useState({ title: "", description: "", type: defaultType });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      notifyError("Please attach a file before uploading.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("type", form.type);
      payload.append("file", file);

      const response = await fetch(`${API_BASE}/resources`, {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload resource.");
      }

      notifySuccess(data.message || "Resource uploaded.");
      setForm({ title: "", description: "", type: defaultType });
      setFile(null);
      if (onSuccess) onSuccess(data.resource);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Title</span>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
          >
            {resourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Description</span>
        <textarea
          className="h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">File</span>
        <input
          type="file"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Uploading..." : "Upload Resource"}
      </button>
    </form>
  );
};

export default ResourceUpload;
