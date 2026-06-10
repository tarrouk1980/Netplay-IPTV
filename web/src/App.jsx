import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import GDPRBanner from './components/GDPRBanner'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import HotelDetailPage from './pages/HotelDetailPage'
import FlashDealsPage from './pages/FlashDealsPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import HotelManagerPage from './pages/HotelManagerPage'
// Spanish pages
import HomePageES from './pages/es/HomePageES'
import BlogES from './pages/es/BlogES'
import SearchResultsPageES from './pages/es/SearchResultsPageES'
import { PrivacyPolicy, TermsOfService, CookiePolicy } from './pages/es/LegalPages'

function NotFoundPage() {
  return (
    <div style={{ paddingTop: 64, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🏨</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: '#2d3748', marginBottom: 12 }}>404</h1>
      <p style={{ color: '#718096', fontSize: 18, marginBottom: 32 }}>Cette page n'existe pas ou a été déplacée.</p>
      <a href="/" style={{ background: '#FF6B35', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
        Retour à l'accueil →
      </a>
    </div>
  )
}

/**
 * Language detection — redirects Spanish browser users to /es
 * Only fires on the root path (/) to avoid breaking direct /es/* links
 */
function SpanishLanguageDetector() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return
    // Check if already redirected this session
    if (sessionStorage.getItem('lang_redirected')) return

    const browserLang = navigator.language || navigator.userLanguage || ''
    const isSpanish = browserLang.toLowerCase().startsWith('es')

    if (isSpanish) {
      sessionStorage.setItem('lang_redirected', '1')
      navigate('/es', { replace: true })
    }
  }, [location.pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SpanishLanguageDetector />
      <Navbar />
      <Routes>
        {/* ── French/Arabic routes (existing) ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/hotel/:id" element={<HotelDetailPage />} />
        <Route path="/flash-deals" element={<FlashDealsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/hoteliers" element={<HotelManagerPage />} />

        {/* ── Spanish routes ── */}
        <Route path="/es" element={<HomePageES />} />
        <Route path="/es/buscar" element={<SearchResultsPageES />} />
        <Route path="/es/blog" element={<BlogES />} />

        {/* ── Legal pages (Spain / EU) ── */}
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsOfService />} />
        <Route path="/politica-de-cookies" element={<CookiePolicy />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <GDPRBanner />
    </BrowserRouter>
  )
}
