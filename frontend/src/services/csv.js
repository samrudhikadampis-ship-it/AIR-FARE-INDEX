export function downloadCsv(filename, rows, columns) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = typeof c.value === 'function' ? c.value(row) : row[c.key]
          const text = raw == null ? '' : String(raw)
          return `"${text.replace(/"/g, '""')}"`
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
