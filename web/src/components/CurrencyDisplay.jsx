import React from 'react'

const RATES = { TND: 0.30, MAD: 0.093, DZD: 0.0073, EGP: 0.019, MRU: 0.025, EUR: 1 }

/**
 * CurrencyDisplay — Shows price in local currency + EUR equivalent
 * Example output: "285 TND  ≈ 87€"
 *
 * @param {number} amount - Price in local currency
 * @param {string} currency - Currency code (TND, MAD, DZD, EGP, MRU, EUR)
 * @param {boolean} showEUR - Whether to show EUR equivalent (default true)
 * @param {object} style - Additional styles for wrapper
 */
export default function CurrencyDisplay({ amount, currency, showEUR = true, style = {} }) {
  const eurAmount = Math.round(amount * (RATES[currency] || 1))
  const isEUR = currency === 'EUR'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', ...style }}>
      <span style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35', lineHeight: 1.2 }}>
        {amount.toLocaleString('es-ES')} {currency}
      </span>
      {showEUR && !isEUR && (
        <span style={{ fontSize: 13, color: '#718096', fontWeight: 500, marginTop: 2 }}>
          ≈ {eurAmount.toLocaleString('es-ES')}€
        </span>
      )}
    </div>
  )
}

/**
 * Inline variant — "285 TND (~87€)" on one line
 */
export function CurrencyInline({ amount, currency, showEUR = true }) {
  const eurAmount = Math.round(amount * (RATES[currency] || 1))
  const isEUR = currency === 'EUR'

  if (isEUR || !showEUR) {
    return (
      <span style={{ fontWeight: 700, color: '#FF6B35' }}>
        {amount.toLocaleString('es-ES')} {currency}
      </span>
    )
  }

  return (
    <span>
      <span style={{ fontWeight: 700, color: '#FF6B35' }}>
        {amount.toLocaleString('es-ES')} {currency}
      </span>
      {' '}
      <span style={{ fontSize: '0.85em', color: '#718096' }}>
        (~{eurAmount.toLocaleString('es-ES')}€)
      </span>
    </span>
  )
}

/**
 * Helper function to convert any currency to EUR
 */
export function toEUR(amount, currency) {
  return Math.round(amount * (RATES[currency] || 1))
}
