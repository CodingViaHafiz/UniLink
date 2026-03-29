/**
 * MarkdownToolbar — helper buttons that insert markdown syntax into a textarea.
 * Pass the textarea ref and the state setter.
 */

const actions = [
  { label: "B", title: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", prefix: "*", suffix: "*", placeholder: "italic text", italic: true },
  { label: "H1", title: "Heading 1", prefix: "# ", suffix: "", placeholder: "Heading", block: true },
  { label: "H2", title: "Heading 2", prefix: "## ", suffix: "", placeholder: "Subheading", block: true },
  { label: "H3", title: "Heading 3", prefix: "### ", suffix: "", placeholder: "Section", block: true },
  { label: "•", title: "Bullet List", prefix: "- ", suffix: "", placeholder: "List item", block: true },
  { label: "1.", title: "Numbered List", prefix: "1. ", suffix: "", placeholder: "List item", block: true },
  { label: ">", title: "Quote", prefix: "> ", suffix: "", placeholder: "Quote", block: true },
  { label: "—", title: "Divider", prefix: "\n---\n", suffix: "", placeholder: "", block: true },
];

const MarkdownToolbar = ({ textareaRef, value, onChange }) => {
  const insert = (action) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const text = selected || action.placeholder;

    const needsNewline = action.block && start > 0 && value[start - 1] !== "\n";
    const pre = needsNewline ? "\n" : "";

    const insertion = `${pre}${action.prefix}${text}${action.suffix}`;
    const newValue = value.substring(0, start) + insertion + value.substring(end);
    onChange(newValue);

    // Restore cursor after React re-render
    const cursorPos = start + pre.length + action.prefix.length + text.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.title}
          onClick={() => insert(action)}
          className={`rounded-md px-2 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-800 ${action.italic ? "italic" : ""}`}
        >
          {action.label}
        </button>
      ))}
      <span className="ml-auto text-[9px] text-slate-400">Supports Markdown</span>
    </div>
  );
};

export default MarkdownToolbar;
