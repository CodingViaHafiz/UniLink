import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

const DataTable = ({ title, columns = [], rows = [] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900">{title}</h2>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((value, cellIndex) => (
                <td key={`${value}-${cellIndex}`} className="border-b border-slate-100 px-3 py-3 text-sm font-medium text-slate-700">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const NewsForm = () => {
  const [form, setForm] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setFeedback({ type: "success", text: "News published successfully." });
      setForm({ title: "", content: "" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900">Publish News</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Content</span>
          <textarea
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            className="h-44 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
            required
          />
        </label>

        {feedback.text && (
          <p
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            ].join(" ")}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Publishing..." : "Publish News"}
        </button>
      </form>
    </section>
  );
};

const UploadPanel = ({ uploadType }) => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", text: "" });
    if (!file) {
      setFeedback({ type: "error", text: "Please choose a file first." });
      return;
    }

    setIsSubmitting(true);
    try {
      const sizeKb = Math.round(file.size / 1024);
      const data = await apiFetch(`/admin/uploads/${uploadType}`, {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "unknown",
          sizeKb,
        }),
      });

      setFeedback({ type: "success", text: data.message || "Upload scaffold request submitted." });
      setFile(null);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900">Upload Center</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Select File</span>
          <input
            type="file"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <p className="text-xs font-semibold text-slate-500">
          Placeholder integration is active. This sends metadata to admin upload scaffold endpoints.
        </p>

        {feedback.text && (
          <p
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            ].join(" ")}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Upload Request"}
        </button>
      </form>
    </section>
  );
};

const AdminModulePage = ({ module }) => {
  const [moduleMessage, setModuleMessage] = useState("");

  const moduleKey = useMemo(() => module.path.replaceAll("/", "-"), [module.path]);

  useEffect(() => {
    const loadModuleState = async () => {
      try {
        const data = await apiFetch(`/admin/placeholders/${moduleKey}`, { method: "GET" });
        setModuleMessage(data.message);
      } catch {
        setModuleMessage("Placeholder backend status could not be loaded.");
      }
    };

    loadModuleState();
  }, [moduleKey]);

  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{module.title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">{module.description}</p>
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{moduleMessage}</p>
      </section>

      {module.mode === "news-form" && <NewsForm />}
      {module.mode === "upload" && <UploadPanel uploadType={module.uploadType} />}
      {!module.mode && <DataTable title={module.tableTitle} columns={module.columns} rows={module.rows} />}
    </main>
  );
};

export default AdminModulePage;
