export default function TitlebarButton({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--text-muted)] hover:bg-[var(--accent-red-hover)] hover:text-[var(--accent-red)] transition-colors"
    >
      {children}
    </button>
  )
}
