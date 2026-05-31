import React from 'react';
import Svg, { Circle, Rect, Path, G, Ellipse } from 'react-native-svg';

export default function ServiceIcon({ service, size = 60 }) {
  const s = size;
  switch (service) {

    // ── EASYTAXY — berline jaune #F5C518, style sedan ──
    case 'EASYTAXY':
      return (
        <Svg width={s} height={s} viewBox="0 0 80 60">
          {/* Body */}
          <Path d="M8 38 Q8 30 14 28 L20 18 Q22 14 28 14 L52 14 Q58 14 60 18 L66 28 Q72 30 72 38 L72 44 Q72 46 70 46 L10 46 Q8 46 8 44 Z" fill="#F5C518" />
          {/* Roof */}
          <Path d="M22 28 L25 17 Q26 14 30 14 L50 14 Q54 14 55 17 L58 28 Z" fill="#E6B800" />
          {/* Windshield */}
          <Path d="M24 27 L27 18 Q28 15 31 15 L49 15 Q52 15 53 18 L56 27 Z" fill="#B3E5FC" opacity="0.85" />
          {/* Side windows */}
          <Rect x="14" y="26" width="10" height="8" rx="2" fill="#B3E5FC" opacity="0.85" />
          {/* Taxi sign */}
          <Rect x="33" y="11" width="14" height="5" rx="2" fill="#1A1A1A" />
          <Rect x="35" y="12.5" width="10" height="2" rx="1" fill="#F5C518" />
          {/* Lights front */}
          <Rect x="9" y="36" width="6" height="4" rx="2" fill="#FFFDE7" />
          {/* Lights rear */}
          <Rect x="65" y="36" width="6" height="4" rx="2" fill="#E53935" />
          {/* Wheels */}
          <Circle cx="22" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="22" cy="47" r="5.5" fill="#444" />
          <Circle cx="22" cy="47" r="2.5" fill="#888" />
          <Circle cx="58" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="58" cy="47" r="5.5" fill="#444" />
          <Circle cx="58" cy="47" r="2.5" fill="#888" />
          {/* Stripe */}
          <Rect x="8" y="34" width="64" height="3" fill="#E6B800" opacity="0.4" />
        </Svg>
      );

    // ── EASYLADY — berline rose/or, style premium ──
    case 'EASYLADY':
      return (
        <Svg width={s} height={s} viewBox="0 0 80 60">
          {/* Body */}
          <Path d="M8 38 Q8 30 14 28 L20 18 Q22 14 28 14 L52 14 Q58 14 60 18 L66 28 Q72 30 72 38 L72 44 Q72 46 70 46 L10 46 Q8 46 8 44 Z" fill="#F48FB1" />
          {/* Roof */}
          <Path d="M22 28 L25 17 Q26 14 30 14 L50 14 Q54 14 55 17 L58 28 Z" fill="#EC407A" />
          {/* Windshield */}
          <Path d="M24 27 L27 18 Q28 15 31 15 L49 15 Q52 15 53 18 L56 27 Z" fill="#FCE4EC" opacity="0.85" />
          {/* Side windows */}
          <Rect x="14" y="26" width="10" height="8" rx="2" fill="#FCE4EC" opacity="0.85" />
          {/* Gold trim */}
          <Path d="M8 40 L72 40" stroke="#D4AF37" strokeWidth="2" />
          <Rect x="9" y="36" width="6" height="4" rx="2" fill="#D4AF37" />
          <Rect x="65" y="36" width="6" height="4" rx="2" fill="#D4AF37" />
          {/* Gold rims */}
          <Circle cx="22" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="22" cy="47" r="5.5" fill="#D4AF37" />
          <Circle cx="22" cy="47" r="2.5" fill="#1A1A1A" />
          <Circle cx="58" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="58" cy="47" r="5.5" fill="#D4AF37" />
          <Circle cx="58" cy="47" r="2.5" fill="#1A1A1A" />
          {/* Lady sign on door */}
          <Circle cx="40" cy="36" r="4" fill="#EC407A" />
          <Path d="M40 33 L40 39 M37.5 37 L42.5 37" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          {/* Roof sign */}
          <Rect x="33" y="11" width="14" height="5" rx="2" fill="#EC407A" />
          <Rect x="35" y="12.5" width="10" height="2" rx="1" fill="#FFFFFF" />
        </Svg>
      );

    // ── EASYACCESS — berline jaune + badge bleu PMR ──
    case 'EASYACCESS':
      return (
        <Svg width={s} height={s} viewBox="0 0 80 60">
          <Path d="M8 38 Q8 30 14 28 L20 18 Q22 14 28 14 L52 14 Q58 14 60 18 L66 28 Q72 30 72 38 L72 44 Q72 46 70 46 L10 46 Q8 46 8 44 Z" fill="#F5C518" />
          <Path d="M22 28 L25 17 Q26 14 30 14 L50 14 Q54 14 55 17 L58 28 Z" fill="#E6B800" />
          <Path d="M24 27 L27 18 Q28 15 31 15 L49 15 Q52 15 53 18 L56 27 Z" fill="#BBDEFB" opacity="0.9" />
          <Rect x="14" y="26" width="10" height="8" rx="2" fill="#BBDEFB" opacity="0.85" />
          <Rect x="33" y="11" width="14" height="5" rx="2" fill="#1565C0" />
          <Rect x="35" y="12.5" width="10" height="2" rx="1" fill="#FFFFFF" />
          <Rect x="9" y="36" width="6" height="4" rx="2" fill="#FFFDE7" />
          <Rect x="65" y="36" width="6" height="4" rx="2" fill="#E53935" />
          <Circle cx="22" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="22" cy="47" r="5.5" fill="#444" />
          <Circle cx="22" cy="47" r="2.5" fill="#888" />
          <Circle cx="58" cy="47" r="9" fill="#1A1A1A" />
          <Circle cx="58" cy="47" r="5.5" fill="#444" />
          <Circle cx="58" cy="47" r="2.5" fill="#888" />
          {/* Wheelchair badge */}
          <Circle cx="62" cy="20" r="7" fill="#1565C0" />
          <Circle cx="62" cy="17" r="1.8" fill="#FFFFFF" />
          <Path d="M62 19 L62 23 L65 23" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M60 21 L64 21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="65" cy="25" r="2" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
        </Svg>
      );

    // ── SOS — camion plateau sombre + voiture + orange accents ──
    case 'SOS':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Truck flatbed platform */}
          <Rect x="4" y="36" width="68" height="8" rx="2" fill="#2D3142" />
          {/* Cab body */}
          <Path d="M4 20 Q4 12 10 12 L30 12 Q36 12 38 16 L44 36 L4 36 Z" fill="#1C2033" />
          {/* Cab window */}
          <Path d="M8 16 Q8 13 11 13 L28 13 Q31 13 33 16 L38 30 L8 30 Z" fill="#37474F" opacity="0.9" />
          <Path d="M9 15 Q10 13.5 13 13.5 L27 13.5 Q30 13.5 32 16 L36 28 L10 28 Z" fill="#4FC3F7" opacity="0.5" />
          {/* Rear chassis */}
          <Rect x="44" y="28" width="28" height="16" rx="2" fill="#2D3142" />
          {/* Orange accent stripe */}
          <Rect x="4" y="38" width="68" height="3" fill="#F5A623" />
          {/* Orange light bar on cab roof */}
          <Rect x="6" y="10" width="20" height="4" rx="2" fill="#F5A623" />
          {/* Front lights */}
          <Rect x="4" y="24" width="5" height="5" rx="1.5" fill="#FFFDE7" />
          <Rect x="4" y="30" width="5" height="3" rx="1" fill="#E53935" />
          {/* Crane arm */}
          <Rect x="66" y="6" width="5" height="30" rx="2" fill="#3D4460" />
          <Path d="M66 8 L82 2 L84 7 L68 13 Z" fill="#3D4460" />
          {/* Hook */}
          <Path d="M82 7 L82 18 Q82 22 78 22 Q74 22 74 18" stroke="#3D4460" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Car on flatbed */}
          <Path d="M46 28 Q46 24 50 22 L54 18 Q56 16 60 16 L72 16 Q76 16 78 18 L82 22 Q86 24 86 28 Z" fill="#37474F" opacity="0.85" />
          <Path d="M54 22 L56 18 Q57 16 60 16 L70 16 Q73 16 74 18 L76 22 Z" fill="#4FC3F7" opacity="0.4" />
          {/* Truck wheels */}
          <Circle cx="18" cy="46" r="10" fill="#111827" />
          <Circle cx="18" cy="46" r="6" fill="#374151" />
          <Circle cx="18" cy="46" r="2.5" fill="#6B7280" />
          <Circle cx="54" cy="46" r="10" fill="#111827" />
          <Circle cx="54" cy="46" r="6" fill="#374151" />
          <Circle cx="54" cy="46" r="2.5" fill="#6B7280" />
          {/* Car on flatbed wheels (small) */}
          <Circle cx="62" cy="30" r="4" fill="#1A1A1A" />
          <Circle cx="78" cy="30" r="4" fill="#1A1A1A" />
          {/* SOS badge */}
          <Rect x="44" y="14" width="18" height="10" rx="2.5" fill="#E53935" />
          <Path d="M47 22 Q47 17 50 17 Q53 17 53 19.5 Q53 22 50 22 Q53 22 53 24" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M56 17 L56 24 M54.5 17 L57.5 17 M54.5 24 L57.5 24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M61 22 Q61 17 61 17" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );

    // ── DELIVERY — scooter orange + livreur casque bleu + colis ──
    case 'DELIVERY':
      return (
        <Svg width={s} height={s} viewBox="0 0 80 60">
          {/* Package / box on rear */}
          <Rect x="6" y="24" width="18" height="16" rx="2" fill="#90A4AE" />
          <Rect x="6" y="24" width="18" height="5" rx="2" fill="#78909C" />
          <Rect x="12" y="24" width="2" height="16" fill="#78909C" opacity="0.5" />
          <Path d="M8 26 L22 26" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
          {/* Orange square on box */}
          <Rect x="10" y="30" width="8" height="7" rx="1" fill="#F5A623" />
          {/* Scooter body */}
          <Path d="M24 40 Q24 34 30 30 L42 28 Q50 26 56 30 L64 34 Q68 36 68 42 L24 42 Z" fill="#F5A623" />
          {/* Seat */}
          <Path d="M38 28 Q42 22 52 24 L56 28" fill="#E69520" />
          <Rect x="36" y="22" width="18" height="6" rx="3" fill="#E69520" />
          {/* Handlebar */}
          <Path d="M60 28 L65 24 L70 26" stroke="#2D3142" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Rider body */}
          <Ellipse cx="48" cy="26" rx="7" ry="10" fill="#2196F3" />
          {/* Helmet */}
          <Circle cx="48" cy="16" r="9" fill="#1565C0" />
          <Ellipse cx="48" cy="19" rx="6" ry="3" fill="#0D47A1" opacity="0.6" />
          {/* Visor */}
          <Path d="M41 17 Q41 13 48 13 Q55 13 55 17 Z" fill="#0D47A1" />
          <Path d="M42 16 Q42 13.5 48 13.5 Q54 13.5 54 16" fill="#4FC3F7" opacity="0.5" />
          {/* Rider arm */}
          <Path d="M54 26 Q60 26 65 25" stroke="#2196F3" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Exhaust */}
          <Path d="M24 40 L18 42 L14 44" stroke="#B0BEC5" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Wheels */}
          <Circle cx="30" cy="46" r="10" fill="#1A1A1A" />
          <Circle cx="30" cy="46" r="6" fill="#374151" />
          <Circle cx="30" cy="46" r="2.5" fill="#6B7280" />
          <Circle cx="62" cy="46" r="10" fill="#1A1A1A" />
          <Circle cx="62" cy="46" r="6" fill="#374151" />
          <Circle cx="62" cy="46" r="2.5" fill="#6B7280" />
          {/* Front fork */}
          <Path d="M68 42 L70 36 L72 36 L70 46" stroke="#E69520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Svg>
      );

    // ── GROCERY — caddie violet stylisé ──
    // ── CLIENT — silhouette personne bleu moderne ──
    case 'CLIENT':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          {/* Fond cercle */}
          <Circle cx="30" cy="30" r="28" fill="#1565C0" opacity="0.15" />
          {/* Tête */}
          <Circle cx="30" cy="20" r="10" fill="#1976D2" />
          {/* Corps */}
          <Path d="M10 52 Q10 36 30 36 Q50 36 50 52 Z" fill="#1976D2" />
          {/* Reflet tête */}
          <Circle cx="26" cy="17" r="3.5" fill="#42A5F5" opacity="0.4" />
        </Svg>
      );

    case 'GROCERY':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          {/* Handle */}
          <Path d="M6 10 L16 10" stroke="#7B1FA2" strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M16 10 L21 24" stroke="#7B1FA2" strokeWidth="3.5" strokeLinecap="round" />
          {/* Cart body */}
          <Path d="M21 24 L54 24 L50 44 L24 44 Z" fill="#9C27B0" />
          {/* Cart ribs */}
          <Path d="M26 24 L24 44" stroke="#7B1FA2" strokeWidth="1.2" />
          <Path d="M34 24 L34 44" stroke="#7B1FA2" strokeWidth="1.2" />
          <Path d="M42 24 L42 44" stroke="#7B1FA2" strokeWidth="1.2" />
          <Path d="M50 24 L50 44" stroke="#7B1FA2" strokeWidth="1.2" />
          <Path d="M22 30 L52 30" stroke="#7B1FA2" strokeWidth="1" />
          <Path d="M22 36 L51 36" stroke="#7B1FA2" strokeWidth="1" />
          {/* Products in cart (coloured blocks) */}
          <Rect x="26" y="26" width="6" height="6" rx="1.5" fill="#F5A623" opacity="0.9" />
          <Rect x="34" y="26" width="6" height="6" rx="1.5" fill="#E53935" opacity="0.9" />
          <Rect x="42" y="26" width="6" height="6" rx="1.5" fill="#43A047" opacity="0.9" />
          {/* Wheels */}
          <Circle cx="28" cy="50" r="5.5" fill="#7B1FA2" />
          <Circle cx="28" cy="50" r="2.5" fill="#1A1A1A" />
          <Circle cx="46" cy="50" r="5.5" fill="#7B1FA2" />
          <Circle cx="46" cy="50" r="2.5" fill="#1A1A1A" />
        </Svg>
      );

    // ── RESTAURANT — cloche + couverts ──
    case 'RESTAURANT':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Ellipse cx="30" cy="44" rx="24" ry="6" fill="#F5A623" />
          <Ellipse cx="30" cy="44" rx="20" ry="4.5" fill="#E69520" />
          <Path d="M10 42 Q10 22 30 22 Q50 22 50 42 Z" fill="#F5A623" />
          <Path d="M14 36 Q16 26 24 23" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.4" />
          <Rect x="26" y="15" width="8" height="8" rx="4" fill="#E69520" />
          <Circle cx="30" cy="16" r="3.5" fill="#F5A623" />
          <Rect x="28" y="8" width="4" height="8" rx="2" fill="#E69520" />
          {/* Fork */}
          <Path d="M6 8 L6 32" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M4 8 L4 16" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M8 8 L8 16" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
          {/* Knife */}
          <Path d="M54 8 L54 32" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M54 8 Q57 13 57 19 L54 19" stroke="#9E9E9E" strokeWidth="1.8" fill="none" />
        </Svg>
      );

    // ── PHARMACY — croix verte ──
    case 'PHARMACY':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Rect x="5" y="5" width="50" height="50" rx="12" fill="#2E7D32" />
          <Rect x="22" y="11" width="16" height="38" rx="5" fill="#FFFFFF" />
          <Rect x="11" y="22" width="38" height="16" rx="5" fill="#FFFFFF" />
          <Rect x="25" y="14" width="10" height="32" rx="3" fill="#2E7D32" opacity="0.15" />
          <Rect x="14" y="25" width="32" height="10" rx="3" fill="#2E7D32" opacity="0.15" />
        </Svg>
      );

    // ── BEAUTY — parfum rose ──
    case 'BEAUTY':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Rect x="16" y="28" width="28" height="28" rx="8" fill="#E91E8C" />
          <Rect x="22" y="20" width="16" height="10" rx="4" fill="#C2185B" />
          <Rect x="20" y="14" width="20" height="8" rx="4" fill="#AD1457" />
          <Rect x="38" y="16" width="8" height="4" rx="2" fill="#880E4F" />
          <Path d="M46 16 L52 12" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <Path d="M46 18 L53 18" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <Path d="M46 20 L52 24" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <Rect x="20" y="34" width="20" height="14" rx="3" fill="#FFFFFF" opacity="0.25" />
          <Path d="M20 32 Q22 28 26 30" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        </Svg>
      );

    // ── PETS — patte ──
    case 'PETS':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Ellipse cx="30" cy="40" rx="14" ry="12" fill="#F5A623" />
          <Ellipse cx="18" cy="27" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="27" cy="22" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="36" cy="22" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="44" cy="27" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="18" cy="27" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="27" cy="22" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="36" cy="22" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="44" cy="27" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="26" cy="37" rx="5" ry="4" fill="#E69520" />
        </Svg>
      );

    // ── HIGHTECH — smartphone ──
    case 'HIGHTECH':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Rect x="16" y="6" width="28" height="48" rx="6" fill="#2196F3" />
          <Rect x="18" y="8" width="24" height="44" rx="4" fill="#1565C0" />
          <Rect x="20" y="12" width="20" height="32" rx="3" fill="#0D47A1" />
          <Path d="M24 18 L36 18 L36 22 L30 22 L30 28 L36 28" stroke="#2196F3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M24 28 L27 28 L27 34 L36 34" stroke="#2196F3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Circle cx="24" cy="18" r="2" fill="#64B5F6" />
          <Circle cx="36" cy="28" r="2" fill="#64B5F6" />
          <Circle cx="36" cy="34" r="2" fill="#64B5F6" />
          <Circle cx="24" cy="28" r="2" fill="#64B5F6" />
          <Circle cx="30" cy="50" r="3" fill="#1565C0" />
          <Circle cx="30" cy="50" r="1.5" fill="#2196F3" />
          <Rect x="26" y="10" width="8" height="2" rx="1" fill="#2196F3" />
        </Svg>
      );

    // ── ELECTRO — éclair ──
    case 'ELECTRO':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Rect x="6" y="6" width="48" height="48" rx="10" fill="#F5A623" />
          <Path d="M34 8 L20 32 L28 32 L26 52 L42 26 L34 26 Z" fill="#0A0A0F" />
          <Path d="M34 14 L24 32 L30 32 L28 46 L38 28 L32 28 Z" fill="#F5A623" opacity="0.3" />
        </Svg>
      );

    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          <Rect x="6" y="6" width="48" height="48" rx="10" fill="#2A2A3A" />
          <Path d="M22 30 L30 20 L38 30 L34 30 L34 40 L26 40 L26 30 Z" fill="#8E8E9A" />
        </Svg>
      );
  }
}
