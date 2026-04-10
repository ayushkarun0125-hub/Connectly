import { useState } from 'react'

function Dropdown({ label, items = [] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm">
        {label}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 min-w-44 rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-xl">
          {items.map((item) => (
            <button key={item.label} onClick={item.onClick} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-800">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
