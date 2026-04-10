export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-lg px-3 py-1 text-sm ${active === tab ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
