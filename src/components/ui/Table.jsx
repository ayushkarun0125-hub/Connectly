function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left font-medium text-slate-300">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-t border-slate-800">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2">{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
