import { useEffect } from "react";

// Files the browser can open natively in a tab
const BROWSER_VIEWABLE = new Set(["pdf", "txt", "png", "jpg", "jpeg", "webp", "gif"]);

const getExtension = (url) => {
  if (!url) return "";
  const name = url.split("/").pop().split("?")[0];
  return name.split(".").pop().toLowerCase();
};

const FILE_TYPE_LABELS = {
  pdf:  "PDF Document",
  doc:  "Word Document",
  docx: "Word Document",
  ppt:  "PowerPoint Presentation",
  pptx: "PowerPoint Presentation",
  xls:  "Excel Spreadsheet",
  xlsx: "Excel Spreadsheet",
  txt:  "Text File",
};

const typeColors = {
  notes: "bg-sky-100 text-sky-700",
  "past-papers": "bg-violet-100 text-violet-700",
  timetable: "bg-emerald-100 text-emerald-700",
};

const typeLabels = {
  notes: "Notes",
  "past-papers": "Past Papers",
  timetable: "Timetable",
};

const extractFileName = (url) => {
  if (!url) return "Unknown file";
  const parts = url.split("/");
  const raw = parts[parts.length - 1] || "Unknown file";
  // Strip the timestamp prefix (e.g. "1720000000000-filename.pdf" → "filename.pdf")
  return raw.replace(/^\d+-/, "");
};

const ResourceViewerModal = ({ resource, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const fileName = extractFileName(resource.fileUrl);
  const ext = getExtension(resource.fileUrl);
  const canViewInBrowser = BROWSER_VIEWABLE.has(ext);
  const fileTypeLabel = FILE_TYPE_LABELS[ext] || "File";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(15,23,42,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                typeColors[resource.type] || "bg-slate-100 text-slate-600"
              }`}
            >
              {typeLabels[resource.type] || resource.type}
            </span>
            <h2 className="mt-2 text-lg font-black leading-snug text-slate-900">
              {resource.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-200 p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Description</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {resource.description || "No description provided."}
            </p>
          </div>

          {/* File info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate text-sm font-semibold text-slate-700">{fileName}</span>
              <span className="ml-auto shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-slate-500">
                {ext || "file"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-slate-600">{resource.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-slate-600">
                {new Date(resource.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 space-y-3">
          {/* Notice for non-browser-viewable files */}
          {!canViewInBrowser && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-amber-700">
                <span className="font-bold">{fileTypeLabel}</span> cannot be opened in the browser.
                Clicking the button will download it — open it with Microsoft Office or a compatible app.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700"
            >
              {canViewInBrowser ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  See File
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download to View
                </>
              )}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceViewerModal;
