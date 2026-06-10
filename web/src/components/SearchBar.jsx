import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { hotelAPI } from '../services/api'

const SUGGESTIONS = [
  { name: 'Djerba, Tunisie', flag: '🇹🇳' },
  { name: 'Hammamet, Tunisie', flag: '🇹🇳' },
  { name: 'Sousse, Tunisie', flag: '🇹🇳' },
  { name: 'Tunis, Tunisie', flag: '🇹🇳' },
  { name: 'Marrakech, Maroc', flag: '🇲🇦' },
  { name: 'Casablanca, Maroc', flag: '🇲🇦' },
  { name: 'Agadir, Maroc', flag: '🇲🇦' },
  { name: 'Alger, Algérie', flag: '🇩🇿' },
  { name: 'Oran, Algérie', flag: '🇩🇿' },
  { name: 'Sharm El Sheikh, Égypte', flag: '🇪🇬' },
  { name: 'Hurghada, Égypte', flag: '🇪🇬' },
  { name: 'Nouakchott, Mauritanie', flag: '🇲🇷' },
]

export default function SearchBar({ inline = false, initialValues = {}, onSearch }) {
  const navigate = useNavigate()
  const [destination, setDestination] = useState(initialValues.destination || '')
  const [checkin, setCheckin] = useState(initialValues.checkin || '')
  const [checkout, setCheckout] = useState(initialValues.checkout || '')
  const [guests, setGuests] = useState(initialValues.guests || 2)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDestinationChange = (val) => {
    setDestination(val)
    clearTimeout(debounceRef.current)
    if (val.length < 2) {
      setSuggestions(SUGGESTIONS.filter(s => true).slice(0, 6))
      setShowSuggestions(val.length > 0)
      return
    }
    const local = SUGGESTIONS.filter(s => s.name.toLowerCase().includes(val.toLowerCase()))
    if (local.length > 0) {
      setSuggestions(local)
      setShowSuggestions(true)
    } else {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await hotelAPI.autocomplete(val)
          setSuggestions(res.data?.map(d => ({ name: d.name || d, flag: '🌍' })) || [])
          setShowSuggestions(true)
        } catch {
          setSuggestions([])
        }
      }, 300)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const params = new URLSearchParams({ destination, checkin, checkout, guests })
    if (onSearch) {
      onSearch({ destination, checkin, checkout, guests })
    } else {
      navigate(`/search?${params.toString()}`)
    }
    setShowSuggestions(false)
  }

  const inputBase = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    background: '#fff',
    color: '#2d3748',
    transition: 'border-color 0.2s',
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: inline ? '2fr 1fr 1fr 0.7fr auto' : '1fr',
        gap: 12,
      }}>
        {/* Destination */}
        <div style={{ position: 'relative' }} ref={wrapRef}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📍</span>
            <input
              type="text"
              placeholder="Destination, hôtel, ville..."
              value={destination}
              onChange={e => handleDestinationChange(e.target.value)}
              onFocus={() => !destination && setSuggestions(SUGGESTIONS.slice(0, 6)) && setShowSuggestions(true)}
              style={{ ...inputBase, paddingLeft: 36 }}
              onFocus={() => { setSuggestions(SUGGESTIONS.slice(0, 6)); setShowSuggestions(true) }}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: '#fff', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0', marginTop: 4, overflow: 'hidden',
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => { setDestination(s.name); setShowSuggestions(false) }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 14, borderBottom: i < suggestions.length - 1 ? '1px solid #f7fafc' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span>{s.flag}</span>
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-in */}
        <div>
          <input
            type="date"
            value={checkin}
            onChange={e => setCheckin(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={inputBase}
          />
        </div>

        {/* Check-out */}
        <div>
          <input
            type="date"
            value={checkout}
            onChange={e => setCheckout(e.target.value)}
            min={checkin || new Date().toISOString().split('T')[0]}
            style={inputBase}
          />
        </div>

        {/* Guests */}
        <div>
          <select
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            style={inputBase}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'voyageur' : 'voyageurs'}</option>
            ))}
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          style={{
            background: '#FF6B35',
            color: '#fff',
            padding: inline ? '12px 28px' : '14px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
            width: inline ? 'auto' : '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e55a24'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF6B35'}
        >
          🔍 Rechercher
        </button>
      </div>
    </form>
  )
}
