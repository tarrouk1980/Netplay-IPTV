import React from 'react'

export default function RatingBadge({ score, size = 'md' }) {
  const num = parseFloat(score)
  let bg = '#718096'
  let label = 'Bien'
  if (num >= 9) { bg = '#48bb78'; label = 'Exceptionnel' }
  else if (num >= 8) { bg = '#4299e1'; label = 'Très bien' }
  else if (num >= 7) { bg = '#FF6B35'; label = 'Bien' }
  else if (num >= 6) { bg = '#FFC72C'; label = 'Correct' }

  const sizes = {
    sm: { fontSize: 12, padding: '2px 6px', borderRadius: 6 },
    md: { fontSize: 14, padding: '4px 8px', borderRadius: 8 },
    lg: { fontSize: 18, padding: '6px 12px', borderRadius: 10 },
  }
  const s = sizes[size] || sizes.md

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        background: bg,
        color: '#fff',
        fontWeight: 700,
        ...s,
      }}>
        {num.toFixed(1)}
      </span>
      {size !== 'sm' && (
        <span style={{ fontSize: s.fontSize - 2, color: '#718096' }}>{label}</span>
      )}
    </span>
  )
}
