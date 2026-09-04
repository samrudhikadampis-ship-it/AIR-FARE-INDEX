export function getChartTheme(isDark) {
  return {
    grid: isDark ? '#3f3f46' : '#e4e4e7',
    tick: isDark ? '#a1a1aa' : '#71717a',
    line: isDark ? '#fafafa' : '#18181b',
    accent: '#dc2626',
    cursor: isDark ? '#71717a' : '#a1a1aa',
    areaFill: isDark ? '#fafafa' : '#18181b',
    tooltip: {
      fontSize: 12,
      borderRadius: 8,
      borderColor: isDark ? '#3f3f46' : '#e4e4e7',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      color: isDark ? '#fafafa' : '#18181b',
    },
  }
}

export const tickStyle = (isDark, size = 12) => ({
  fontSize: size,
  fill: isDark ? '#a1a1aa' : '#71717a',
})
