import { useEffect } from 'react';

function updateMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateOGMeta(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Updates document.title and meta description dynamically
export default function SEOHead({ title, description, keywords, image }) {
  useEffect(() => {
    document.title = title ? `${title} | EasyHotels Maghreb` : 'EasyHotels Maghreb — Comparez les prix hôtels';
    // Update meta tags
    updateMeta('description', description || 'Comparez les prix des meilleurs hôtels en Tunisie, Maroc, Algérie, Égypte et Mauritanie.');
    updateMeta('keywords', keywords || 'hôtels tunisie, comparateur prix hôtel, booking halal');
    updateOGMeta('og:title', title || 'EasyHotels Maghreb');
    updateOGMeta('og:description', description || 'Comparez les prix des meilleurs hôtels en Afrique du Nord.');
    if (image) {
      updateOGMeta('og:image', image);
    }
  }, [title, description, keywords, image]);
  return null;
}
