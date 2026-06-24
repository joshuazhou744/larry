export default function Sidebar({ width }) {
  return (
    <div
      className="sidebar flex flex-col gap-5 p-4 overflow-y-auto shrink-0"
      style={{ width }}
    >
      <Section label="Map"><Item>Lorem ipsum dolor</Item></Section>
      <Section label="Agent"><Item>Lorem ipsum dolor</Item></Section>
      <Section label="Lineups">
        {['Lorem ipsum 1', 'Lorem ipsum 2', 'Lorem ipsum 3'].map(t => <Item key={t}>{t}</Item>)}
      </Section>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs tracking-widest uppercase text-[var(--text-muted)] font-[Oswald,sans-serif]">
        {label}
      </div>
      {children}
    </div>
  )
}

function Item({ children }) {
  return (
    <div className="bg-[var(--bg-item)] rounded px-2.5 py-1.5 text-xs text-[var(--text-muted)]">
      {children}
    </div>
  )
}
