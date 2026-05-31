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

    // ── TRUCK_PLATEAU — dépanneuse plateau inclinable + voiture dessus ──
    case 'TRUCK_PLATEAU':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Cab */}
          <Path d="M4 18 Q4 10 10 10 L30 10 Q36 10 38 14 L44 34 L4 34 Z" fill="#37474F" />
          <Path d="M8 14 Q9 11 13 11 L28 11 Q32 11 34 14 L40 28 L8 28 Z" fill="#546E7A" />
          <Path d="M9 14 Q11 12 14 12 L27 12 Q30 12 32 14 L37 26 L10 26 Z" fill="#4FC3F7" opacity="0.45" />
          {/* Chassis / frame */}
          <Rect x="4" y="34" width="82" height="6" rx="2" fill="#263238" />
          {/* Inclined flatbed platform */}
          <Path d="M44 22 L86 34 L86 34 L44 34 Z" fill="#455A64" />
          <Path d="M46 23 L84 33" stroke="#78909C" strokeWidth="1.2" />
          {/* Car on plateau */}
          <Path d="M52 22 Q52 18 56 16 L62 12 Q64 10 68 10 L76 10 Q80 10 82 12 L86 16 Q88 18 88 22 Z" fill="#90A4AE" opacity="0.85" />
          <Path d="M60 20 L62 14 Q63 12 66 12 L74 12 Q77 12 78 14 L80 20 Z" fill="#4FC3F7" opacity="0.4" />
          <Circle cx="58" cy="24" r="3.5" fill="#1A1A1A" />
          <Circle cx="82" cy="24" r="3.5" fill="#1A1A1A" />
          {/* Truck wheels */}
          <Circle cx="18" cy="43" r="9" fill="#111827" />
          <Circle cx="18" cy="43" r="5.5" fill="#374151" />
          <Circle cx="18" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="52" cy="43" r="9" fill="#111827" />
          <Circle cx="52" cy="43" r="5.5" fill="#374151" />
          <Circle cx="52" cy="43" r="2.5" fill="#6B7280" />
          {/* Orange stripe */}
          <Rect x="4" y="36" width="82" height="2.5" fill="#F5A623" />
          {/* Front light */}
          <Rect x="4" y="22" width="5" height="5" rx="1.5" fill="#FFFDE7" />
        </Svg>
      );

    // ── TRUCK_LEVE_ROUE — lève-roue (J-bar levant les roues avant) ──
    case 'TRUCK_LEVE_ROUE':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Cab */}
          <Path d="M4 18 Q4 10 10 10 L30 10 Q36 10 38 14 L44 34 L4 34 Z" fill="#1B5E20" />
          <Path d="M9 14 Q11 12 14 12 L27 12 Q30 12 32 14 L37 26 L10 26 Z" fill="#4FC3F7" opacity="0.45" />
          {/* Chassis */}
          <Rect x="4" y="34" width="82" height="5" rx="2" fill="#1A237E" />
          {/* Flat bed */}
          <Rect x="44" y="30" width="42" height="9" rx="2" fill="#283593" />
          {/* J-bar arm extending from rear */}
          <Rect x="78" y="16" width="6" height="22" rx="2" fill="#4CAF50" />
          {/* J-hook */}
          <Path d="M81 16 Q81 8 74 8 Q68 8 68 14" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Car being towed (front lifted) */}
          <Path d="M50 30 Q50 26 54 24 L58 20 Q60 18 64 18 L74 18 Q78 18 79 20 L82 24 Q83 26 83 30 Z" fill="#546E7A" opacity="0.9" />
          <Path d="M57 28 L59 22 Q60 20 63 20 L72 20 Q75 20 76 22 L78 28 Z" fill="#4FC3F7" opacity="0.35" />
          {/* Front wheels lifted by J-bar */}
          <Circle cx="68" cy="14" r="5" fill="#1A1A1A" />
          <Circle cx="68" cy="14" r="3" fill="#374151" />
          {/* Rear wheels of towed car on ground */}
          <Circle cx="55" cy="34" r="4" fill="#1A1A1A" />
          <Circle cx="55" cy="34" r="2.5" fill="#374151" />
          {/* Truck wheels */}
          <Circle cx="18" cy="43" r="9" fill="#111827" />
          <Circle cx="18" cy="43" r="5.5" fill="#374151" />
          <Circle cx="18" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="50" cy="43" r="9" fill="#111827" />
          <Circle cx="50" cy="43" r="5.5" fill="#374151" />
          <Circle cx="50" cy="43" r="2.5" fill="#6B7280" />
          {/* Orange stripe */}
          <Rect x="4" y="35.5" width="82" height="2" fill="#F5A623" />
          <Rect x="4" y="22" width="5" height="5" rx="1.5" fill="#FFFDE7" />
        </Svg>
      );

    // ── TRUCK_CROCHET — crochet et chaîne ──
    case 'TRUCK_CROCHET':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Cab */}
          <Path d="M4 18 Q4 10 10 10 L30 10 Q36 10 38 14 L44 34 L4 34 Z" fill="#4A148C" />
          <Path d="M9 14 Q11 12 14 12 L27 12 Q30 12 32 14 L37 26 L10 26 Z" fill="#4FC3F7" opacity="0.45" />
          {/* Chassis */}
          <Rect x="4" y="34" width="82" height="5" rx="2" fill="#311B92" />
          <Rect x="44" y="30" width="42" height="9" rx="2" fill="#4527A0" />
          {/* Boom arm (diagonal) */}
          <Rect x="72" y="8" width="5" height="28" rx="2" fill="#7B1FA2" />
          {/* Hook */}
          <Path d="M74.5 10 Q74.5 4 68 4 Q62 4 62 10 Q62 16 68 16" stroke="#CE93D8" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Chain from hook to car */}
          <Path d="M68 16 L58 28" stroke="#B0BEC5" strokeWidth="1.5" strokeDasharray="3,2" />
          <Path d="M62 22 L52 32" stroke="#B0BEC5" strokeWidth="1.5" strokeDasharray="3,2" />
          {/* Car being towed */}
          <Path d="M44 30 Q44 26 48 24 L54 20 Q56 18 60 18 L72 18 Q76 18 77 20 L80 24 Q82 26 82 30 Z" fill="#546E7A" opacity="0.9" />
          <Path d="M52 28 L54 22 Q55 20 58 20 L69 20 Q72 20 74 22 L76 28 Z" fill="#4FC3F7" opacity="0.35" />
          <Circle cx="50" cy="34" r="4.5" fill="#1A1A1A" />
          <Circle cx="50" cy="34" r="2.5" fill="#374151" />
          <Circle cx="76" cy="34" r="4.5" fill="#1A1A1A" />
          <Circle cx="76" cy="34" r="2.5" fill="#374151" />
          {/* Truck wheels */}
          <Circle cx="18" cy="43" r="9" fill="#111827" />
          <Circle cx="18" cy="43" r="5.5" fill="#374151" />
          <Circle cx="18" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="50" cy="44" r="9" fill="#111827" />
          <Circle cx="50" cy="44" r="5.5" fill="#374151" />
          <Circle cx="50" cy="44" r="2.5" fill="#6B7280" />
          <Rect x="4" y="35.5" width="82" height="2" fill="#F5A623" />
          <Rect x="4" y="22" width="5" height="5" rx="1.5" fill="#FFFDE7" />
        </Svg>
      );

    // ── TRUCK_GRUE — dépanneuse grue à bras articulé ──
    case 'TRUCK_GRUE':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Cab */}
          <Path d="M4 18 Q4 10 10 10 L30 10 Q36 10 38 14 L44 34 L4 34 Z" fill="#B71C1C" />
          <Path d="M9 14 Q11 12 14 12 L27 12 Q30 12 32 14 L37 26 L10 26 Z" fill="#4FC3F7" opacity="0.45" />
          {/* Chassis */}
          <Rect x="4" y="34" width="82" height="5" rx="2" fill="#7F0000" />
          {/* Crane base on truck */}
          <Rect x="56" y="28" width="10" height="12" rx="2" fill="#C62828" />
          {/* Main boom arm */}
          <Path d="M61 28 L76 6" stroke="#EF9A9A" strokeWidth="5" strokeLinecap="round" />
          {/* Secondary arm */}
          <Path d="M76 6 L88 12" stroke="#EF9A9A" strokeWidth="4" strokeLinecap="round" />
          {/* Cable */}
          <Path d="M88 12 L88 32" stroke="#FFCC02" strokeWidth="2" strokeLinecap="round" />
          {/* Hook */}
          <Path d="M88 32 Q88 38 84 38 Q80 38 80 34" stroke="#FFCC02" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Stabilizer legs */}
          <Rect x="44" y="39" width="5" height="8" rx="1.5" fill="#B71C1C" />
          <Rect x="76" y="39" width="5" height="8" rx="1.5" fill="#B71C1C" />
          <Rect x="40" y="46" width="14" height="3" rx="1.5" fill="#7F0000" />
          <Rect x="72" y="46" width="14" height="3" rx="1.5" fill="#7F0000" />
          {/* Truck wheels */}
          <Circle cx="18" cy="43" r="9" fill="#111827" />
          <Circle cx="18" cy="43" r="5.5" fill="#374151" />
          <Circle cx="18" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="50" cy="43" r="9" fill="#111827" />
          <Circle cx="50" cy="43" r="5.5" fill="#374151" />
          <Circle cx="50" cy="43" r="2.5" fill="#6B7280" />
          {/* Orange stripe */}
          <Rect x="4" y="35.5" width="82" height="2" fill="#F5A623" />
          <Rect x="4" y="22" width="5" height="5" rx="1.5" fill="#FFFDE7" />
        </Svg>
      );

    // ── TRUCK_PANIER — fourgon cage / panier fermé ──
    case 'TRUCK_PANIER':
      return (
        <Svg width={s} height={s} viewBox="0 0 90 60">
          {/* Cab */}
          <Path d="M4 18 Q4 10 10 10 L30 10 Q36 10 38 14 L44 34 L4 34 Z" fill="#0D47A1" />
          <Path d="M9 14 Q11 12 14 12 L27 12 Q30 12 32 14 L37 26 L10 26 Z" fill="#4FC3F7" opacity="0.45" />
          {/* Chassis */}
          <Rect x="4" y="34" width="82" height="5" rx="2" fill="#0A2A6E" />
          {/* Closed cage/box body */}
          <Rect x="44" y="8" width="42" height="28" rx="3" fill="#1565C0" />
          {/* Cage bars (vertical) */}
          <Rect x="52" y="10" width="2" height="24" rx="1" fill="#1A237E" />
          <Rect x="60" y="10" width="2" height="24" rx="1" fill="#1A237E" />
          <Rect x="68" y="10" width="2" height="24" rx="1" fill="#1A237E" />
          <Rect x="76" y="10" width="2" height="24" rx="1" fill="#1A237E" />
          {/* Cage bars (horizontal) */}
          <Rect x="44" y="16" width="42" height="2" rx="1" fill="#1A237E" />
          <Rect x="44" y="24" width="42" height="2" rx="1" fill="#1A237E" />
          {/* Door outline rear */}
          <Rect x="78" y="10" width="6" height="24" rx="1" fill="#1976D2" />
          <Rect x="79" y="11" width="4" height="22" rx="1" fill="#1565C0" />
          {/* EASYWAY logo area */}
          <Rect x="48" y="12" width="26" height="10" rx="2" fill="#0D47A1" opacity="0.5" />
          {/* Truck wheels */}
          <Circle cx="18" cy="43" r="9" fill="#111827" />
          <Circle cx="18" cy="43" r="5.5" fill="#374151" />
          <Circle cx="18" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="54" cy="43" r="9" fill="#111827" />
          <Circle cx="54" cy="43" r="5.5" fill="#374151" />
          <Circle cx="54" cy="43" r="2.5" fill="#6B7280" />
          <Circle cx="72" cy="43" r="9" fill="#111827" />
          <Circle cx="72" cy="43" r="5.5" fill="#374151" />
          <Circle cx="72" cy="43" r="2.5" fill="#6B7280" />
          {/* Orange stripe */}
          <Rect x="4" y="35.5" width="82" height="2" fill="#F5A623" />
          <Rect x="4" y="22" width="5" height="5" rx="1.5" fill="#FFFDE7" />
        </Svg>
      );

    // ── TRUCK_PLATEAU — dépanneuse plateau inclinable + voiture dessus ──
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

    // ── ELECTRO — washing machine with porthole ──
    case 'ELECTRO':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          {/* Machine body */}
          <Rect x="8" y="8" width="44" height="48" rx="6" fill="#37474F" />
          <Rect x="10" y="10" width="40" height="44" rx="4" fill="#455A64" />
          {/* Top panel */}
          <Rect x="10" y="10" width="40" height="10" rx="4" fill="#263238" />
          {/* Control buttons */}
          <Circle cx="18" cy="15" r="2.5" fill="#F5A623" />
          <Circle cx="26" cy="15" r="2.5" fill="#4FC3F7" />
          <Rect x="32" y="12.5" width="14" height="5" rx="2.5" fill="#1565C0" />
          <Rect x="34" y="13.5" width="10" height="3" rx="1.5" fill="#37474F" />
          {/* Door ring */}
          <Circle cx="30" cy="36" r="14" fill="#263238" />
          <Circle cx="30" cy="36" r="12" fill="#37474F" />
          {/* Porthole glass */}
          <Circle cx="30" cy="36" r="10" fill="#1565C0" opacity="0.7" />
          <Circle cx="30" cy="36" r="8" fill="#1976D2" opacity="0.5" />
          {/* Water swirl */}
          <Path d="M24 34 Q27 30 30 34 Q33 38 36 34" stroke="#4FC3F7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M24 37 Q27 33 30 37 Q33 41 36 37" stroke="#4FC3F7" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Door handle */}
          <Rect x="38" y="34" width="4" height="4" rx="2" fill="#546E7A" />
          {/* Bottom panel */}
          <Rect x="12" y="50" width="36" height="3" rx="1.5" fill="#263238" />
          <Rect x="16" y="51" width="6" height="1.5" rx="1" fill="#455A64" />
        </Svg>
      );

    // ── SUPERMARKET — storefront with sign, shelves, shopping cart ──
    case 'SUPERMARKET':
      return (
        <Svg width={s} height={s} viewBox="0 0 60 60">
          {/* Building */}
          <Rect x="6" y="22" width="48" height="34" rx="3" fill="#1565C0" />
          {/* Roof / awning */}
          <Rect x="4" y="18" width="52" height="8" rx="3" fill="#0D47A1" />
          {/* Awning stripes */}
          <Rect x="4" y="18" width="8" height="8" rx="0" fill="#1976D2" />
          <Rect x="20" y="18" width="8" height="8" rx="0" fill="#1976D2" />
          <Rect x="36" y="18" width="8" height="8" rx="0" fill="#1976D2" />
          {/* Sign */}
          <Rect x="12" y="8" width="36" height="12" rx="3" fill="#F5A623" />
          <Rect x="16" y="10" width="28" height="8" rx="2" fill="#E69520" />
          {/* Door */}
          <Rect x="23" y="38" width="14" height="18" rx="2" fill="#0D47A1" />
          <Rect x="27" y="44" width="6" height="1.5" rx="1" fill="#4FC3F7" />
          {/* Windows / shelves */}
          <Rect x="8" y="28" width="14" height="12" rx="2" fill="#0D47A1" />
          <Rect x="9" y="30" width="12" height="2" fill="#4FC3F7" opacity="0.5" />
          <Rect x="9" y="34" width="12" height="2" fill="#4FC3F7" opacity="0.5" />
          <Rect x="38" y="28" width="14" height="12" rx="2" fill="#0D47A1" />
          <Rect x="39" y="30" width="12" height="2" fill="#4FC3F7" opacity="0.5" />
          <Rect x="39" y="34" width="12" height="2" fill="#4FC3F7" opacity="0.5" />
          {/* Cart icon on sign */}
          <Path d="M22 12 L24 12 L26 17 L32 17 L33 14 L26 14" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Circle cx="27" cy="18.5" r="1" fill="#FFFFFF" />
          <Circle cx="31" cy="18.5" r="1" fill="#FFFFFF" />
        </Svg>
      );

    // ── VEHICLE_BERLINE — berline grise ──
case 'VEHICLE_BERLINE':
  return (
    <Svg width={s} height={s} viewBox="0 0 80 60">
      <Path d="M8 38 Q8 30 14 28 L20 18 Q22 14 28 14 L52 14 Q58 14 60 18 L66 28 Q72 30 72 38 L72 44 Q72 46 70 46 L10 46 Q8 46 8 44 Z" fill="#546E7A" />
      <Path d="M22 28 L25 17 Q26 14 30 14 L50 14 Q54 14 55 17 L58 28 Z" fill="#455A64" />
      <Path d="M24 27 L27 18 Q28 15 31 15 L49 15 Q52 15 53 18 L56 27 Z" fill="#B3E5FC" opacity="0.7" />
      <Rect x="14" y="26" width="10" height="8" rx="2" fill="#B3E5FC" opacity="0.7" />
      <Rect x="9" y="36" width="6" height="4" rx="2" fill="#FFFDE7" />
      <Rect x="65" y="36" width="6" height="4" rx="2" fill="#E53935" />
      <Circle cx="22" cy="47" r="9" fill="#1A1A1A" /><Circle cx="22" cy="47" r="5.5" fill="#444" /><Circle cx="22" cy="47" r="2.5" fill="#888" />
      <Circle cx="58" cy="47" r="9" fill="#1A1A1A" /><Circle cx="58" cy="47" r="5.5" fill="#444" /><Circle cx="58" cy="47" r="2.5" fill="#888" />
    </Svg>
  );

// ── VEHICLE_SUV — SUV/4x4 haut ──
case 'VEHICLE_SUV':
  return (
    <Svg width={s} height={s} viewBox="0 0 80 60">
      <Path d="M6 40 Q6 30 12 28 L18 16 Q20 12 26 12 L54 12 Q60 12 62 16 L68 28 Q74 30 74 40 L74 46 Q74 48 72 48 L8 48 Q6 48 6 46 Z" fill="#37474F" />
      <Path d="M20 28 L23 15 Q24 12 28 12 L52 12 Q56 12 57 15 L60 28 Z" fill="#2E3F4C" />
      <Path d="M22 27 L25 16 Q26 13 29 13 L51 13 Q54 13 55 16 L58 27 Z" fill="#B3E5FC" opacity="0.6" />
      <Rect x="8" y="28" width="10" height="10" rx="2" fill="#B3E5FC" opacity="0.6" />
      <Rect x="6" y="38" width="6" height="4" rx="2" fill="#FFFDE7" />
      <Rect x="68" y="38" width="6" height="4" rx="2" fill="#E53935" />
      <Rect x="6" y="44" width="68" height="3" fill="#263238" />
      <Circle cx="20" cy="49" r="9" fill="#1A1A1A" /><Circle cx="20" cy="49" r="5.5" fill="#444" /><Circle cx="20" cy="49" r="2.5" fill="#888" />
      <Circle cx="60" cy="49" r="9" fill="#1A1A1A" /><Circle cx="60" cy="49" r="5.5" fill="#444" /><Circle cx="60" cy="49" r="2.5" fill="#888" />
    </Svg>
  );

// ── VEHICLE_MINIVAN — minivan spacieux ──
case 'VEHICLE_MINIVAN':
  return (
    <Svg width={s} height={s} viewBox="0 0 80 60">
      <Path d="M4 40 Q4 30 10 28 L14 14 Q16 10 22 10 L58 10 Q64 10 66 14 L70 28 Q76 30 76 40 L76 46 L4 46 Z" fill="#4527A0" />
      <Path d="M14 28 L17 13 Q18 10 22 10 L56 10 Q60 10 62 13 L66 28 Z" fill="#311B92" />
      <Path d="M16 27 L19 14 Q20 11 23 11 L55 11 Q58 11 60 14 L63 27 Z" fill="#B3E5FC" opacity="0.55" />
      <Rect x="6" y="28" width="10" height="12" rx="2" fill="#B3E5FC" opacity="0.55" />
      <Rect x="4" y="38" width="6" height="5" rx="2" fill="#FFFDE7" />
      <Rect x="70" y="38" width="6" height="5" rx="2" fill="#E53935" />
      <Rect x="4" y="44" width="72" height="3" fill="#1A237E" />
      <Circle cx="18" cy="48" r="9" fill="#1A1A1A" /><Circle cx="18" cy="48" r="5.5" fill="#444" /><Circle cx="18" cy="48" r="2.5" fill="#888" />
      <Circle cx="62" cy="48" r="9" fill="#1A1A1A" /><Circle cx="62" cy="48" r="5.5" fill="#444" /><Circle cx="62" cy="48" r="2.5" fill="#888" />
    </Svg>
  );

// ── VEHICLE_MOTO — moto taxi ──
case 'VEHICLE_MOTO':
  return (
    <Svg width={s} height={s} viewBox="0 0 80 60">
      <Path d="M30 38 Q30 28 38 24 L50 22 Q58 20 62 26 L68 34 Q70 38 68 42 L30 42 Z" fill="#F5A623" />
      <Path d="M44 22 Q48 16 56 18 L60 22" fill="#E69520" />
      <Rect x="42" y="14" width="16" height="6" rx="3" fill="#E69520" />
      <Path d="M58 22 L64 18 L68 20" stroke="#2D3142" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Circle cx="36" cy="44" r="11" fill="#1A1A1A" /><Circle cx="36" cy="44" r="7" fill="#374151" /><Circle cx="36" cy="44" r="3" fill="#6B7280" />
      <Circle cx="64" cy="44" r="11" fill="#1A1A1A" /><Circle cx="64" cy="44" r="7" fill="#374151" /><Circle cx="64" cy="44" r="3" fill="#6B7280" />
      <Path d="M30 40 L24 42 L18 44" stroke="#B0BEC5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Circle cx="50" cy="18" r="6" fill="#1565C0" />
      <Circle cx="50" cy="14" r="5" fill="#0D47A1" />
    </Svg>
  );

// ── DELIV_VELO — vélo de livraison ──
case 'DELIV_VELO':
  return (
    <Svg width={s} height={s} viewBox="0 0 80 60">
      <Circle cx="20" cy="42" r="14" fill="none" stroke="#27AE60" strokeWidth="3.5" />
      <Circle cx="60" cy="42" r="14" fill="none" stroke="#27AE60" strokeWidth="3.5" />
      <Circle cx="20" cy="42" r="3" fill="#27AE60" />
      <Circle cx="60" cy="42" r="3" fill="#27AE60" />
      <Path d="M20 42 L36 22 L60 42" stroke="#27AE60" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M36 22 L44 42" stroke="#27AE60" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M30 22 L42 22" stroke="#27AE60" strokeWidth="3" strokeLinecap="round" />
      <Path d="M36 22 L36 16 L30 12 L42 12 L36 16" stroke="#27AE60" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="46" y="12" width="16" height="14" rx="3" fill="#F5A623" />
      <Rect x="48" y="14" width="12" height="10" rx="2" fill="#E69520" />
      <Path d="M50 14 L50 26 M54 14 L54 26" stroke="#F5A623" strokeWidth="1" />
    </Svg>
  );

// ── DELIV_APIED — livreur à pied ──
case 'DELIV_APIED':
  return (
    <Svg width={s} height={s} viewBox="0 0 60 60">
      <Circle cx="30" cy="10" r="7" fill="#27AE60" />
      <Path d="M30 17 L30 36" stroke="#27AE60" strokeWidth="4" strokeLinecap="round" />
      <Path d="M30 26 L20 34" stroke="#27AE60" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M30 26 L40 30" stroke="#27AE60" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M30 36 L22 48" stroke="#27AE60" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M30 36 L38 48" stroke="#27AE60" strokeWidth="3.5" strokeLinecap="round" />
      <Rect x="36" y="20" width="14" height="12" rx="3" fill="#F5A623" />
      <Rect x="38" y="22" width="10" height="8" rx="2" fill="#E69520" />
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
