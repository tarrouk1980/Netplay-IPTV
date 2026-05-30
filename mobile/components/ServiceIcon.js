import React from 'react';
import Svg, {
  Circle,
  Rect,
  Path,
  G,
  Ellipse,
  Line,
  Polygon,
} from 'react-native-svg';

/**
 * ServiceIcon component
 * Props: service (string), size (default 60)
 *
 * Services: EASYTAXY, EASYLADY, EASYACCESS, SOS, DELIVERY,
 *           GROCERY, RESTAURANT, PHARMACY, BEAUTY, PETS, HIGHTECH, ELECTRO
 */
export default function ServiceIcon({ service, size = 60 }) {
  const s = size;
  const vb = `0 0 60 60`;

  switch (service) {
    // ──────────────────────────────────────────────
    // EASYTAXY — taxi jaune #F5A623
    // ──────────────────────────────────────────────
    case 'EASYTAXY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Body */}
          <Rect x="8" y="22" width="44" height="22" rx="5" fill="#F5A623" />
          {/* Roof */}
          <Path d="M16 22 L20 10 L40 10 L44 22 Z" fill="#F5A623" />
          {/* Taxi sign */}
          <Rect x="23" y="10" width="14" height="7" rx="2" fill="#0A0A0F" />
          <Rect x="25" y="12" width="10" height="3" rx="1" fill="#F5A623" />
          {/* Windows */}
          <Rect x="20" y="13" width="8" height="7" rx="2" fill="#B3E5FC" opacity="0.9" />
          <Rect x="32" y="13" width="8" height="7" rx="2" fill="#B3E5FC" opacity="0.9" />
          {/* Wheels */}
          <Circle cx="17" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="17" cy="44" r="4" fill="#555" />
          <Circle cx="17" cy="44" r="1.5" fill="#888" />
          <Circle cx="43" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="43" cy="44" r="4" fill="#555" />
          <Circle cx="43" cy="44" r="1.5" fill="#888" />
          {/* Lights */}
          <Rect x="8" y="26" width="5" height="4" rx="1" fill="#FFF9C4" />
          <Rect x="47" y="26" width="5" height="4" rx="1" fill="#EF9A9A" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // EASYLADY — taxi avec touches roses #E91E8C
    // ──────────────────────────────────────────────
    case 'EASYLADY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Body */}
          <Rect x="8" y="22" width="44" height="22" rx="5" fill="#F5A623" />
          {/* Roof rose */}
          <Path d="M16 22 L20 10 L40 10 L44 22 Z" fill="#E91E8C" />
          {/* Pink stripe on body */}
          <Rect x="8" y="30" width="44" height="4" fill="#E91E8C" opacity="0.5" />
          {/* Taxi sign */}
          <Rect x="23" y="10" width="14" height="7" rx="2" fill="#E91E8C" />
          <Rect x="25" y="12" width="10" height="3" rx="1" fill="#FFFFFF" />
          {/* Windows */}
          <Rect x="20" y="13" width="8" height="7" rx="2" fill="#F8BBD9" opacity="0.9" />
          <Rect x="32" y="13" width="8" height="7" rx="2" fill="#F8BBD9" opacity="0.9" />
          {/* Wheels */}
          <Circle cx="17" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="17" cy="44" r="4" fill="#555" />
          <Circle cx="17" cy="44" r="1.5" fill="#888" />
          <Circle cx="43" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="43" cy="44" r="4" fill="#555" />
          <Circle cx="43" cy="44" r="1.5" fill="#888" />
          {/* Lights */}
          <Rect x="8" y="26" width="5" height="4" rx="1" fill="#FFF9C4" />
          <Rect x="47" y="26" width="5" height="4" rx="1" fill="#EF9A9A" />
          {/* Female symbol heart accent */}
          <Circle cx="48" cy="14" r="3" fill="#E91E8C" />
          <Path d="M48 17 L48 21" stroke="#E91E8C" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M46 19 L50 19" stroke="#E91E8C" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // EASYACCESS — taxi PMR touches bleues #2196F3
    // ──────────────────────────────────────────────
    case 'EASYACCESS':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Body */}
          <Rect x="8" y="22" width="44" height="22" rx="5" fill="#F5A623" />
          {/* Roof blue */}
          <Path d="M16 22 L20 10 L40 10 L44 22 Z" fill="#2196F3" />
          {/* Taxi sign */}
          <Rect x="23" y="10" width="14" height="7" rx="2" fill="#2196F3" />
          <Rect x="25" y="12" width="10" height="3" rx="1" fill="#FFFFFF" />
          {/* Windows */}
          <Rect x="20" y="13" width="8" height="7" rx="2" fill="#BBDEFB" opacity="0.9" />
          <Rect x="32" y="13" width="8" height="7" rx="2" fill="#BBDEFB" opacity="0.9" />
          {/* Wheels */}
          <Circle cx="17" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="17" cy="44" r="4" fill="#555" />
          <Circle cx="17" cy="44" r="1.5" fill="#888" />
          <Circle cx="43" cy="44" r="7" fill="#1C1C28" />
          <Circle cx="43" cy="44" r="4" fill="#555" />
          <Circle cx="43" cy="44" r="1.5" fill="#888" />
          {/* Lights */}
          <Rect x="8" y="26" width="5" height="4" rx="1" fill="#FFF9C4" />
          <Rect x="47" y="26" width="5" height="4" rx="1" fill="#EF9A9A" />
          {/* Wheelchair symbol */}
          <Circle cx="49" cy="14" r="1.8" fill="#FFFFFF" />
          <Path d="M49 16 L49 20 L52 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M47 18 L51 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="52" cy="22" r="2" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // SOS — camion remorquage
    // ──────────────────────────────────────────────
    case 'SOS':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Truck body */}
          <Rect x="4" y="26" width="36" height="20" rx="3" fill="#1C1C28" />
          {/* Cab */}
          <Rect x="4" y="20" width="16" height="12" rx="3" fill="#2A2A3A" />
          {/* Window */}
          <Rect x="6" y="22" width="11" height="7" rx="2" fill="#4FC3F7" opacity="0.8" />
          {/* Crane arm */}
          <Rect x="36" y="14" width="4" height="20" rx="2" fill="#E74C3C" />
          <Path d="M36 14 L52 8 L54 12 L38 18 Z" fill="#E74C3C" />
          {/* Hook */}
          <Path d="M52 12 L52 22 Q52 26 48 26 Q44 26 44 22" stroke="#E74C3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Wheels */}
          <Circle cx="14" cy="46" r="7" fill="#111" />
          <Circle cx="14" cy="46" r="4" fill="#333" />
          <Circle cx="14" cy="46" r="1.8" fill="#666" />
          <Circle cx="30" cy="46" r="7" fill="#111" />
          <Circle cx="30" cy="46" r="4" fill="#333" />
          <Circle cx="30" cy="46" r="1.8" fill="#666" />
          {/* Red emergency light */}
          <Rect x="6" y="18" width="6" height="3" rx="1.5" fill="#E74C3C" />
          {/* SOS text */}
          <Rect x="38" y="30" width="18" height="10" rx="2" fill="#E74C3C" />
          <Path d="M41 38 Q41 33 44 33 Q47 33 47 36 Q47 38 44 38 Q47 38 47 40" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // DELIVERY — scooter vert #27AE60
    // ──────────────────────────────────────────────
    case 'DELIVERY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Delivery box */}
          <Rect x="8" y="10" width="22" height="18" rx="3" fill="#27AE60" />
          <Rect x="8" y="10" width="22" height="5" rx="3" fill="#1E8449" />
          <Path d="M15 10 L15 28" stroke="#1E8449" strokeWidth="1" />
          <Path d="M23 10 L23 28" stroke="#1E8449" strokeWidth="1" />
          <Path d="M11 12 L19 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Scooter body */}
          <Path d="M28 28 Q32 28 36 28 L42 28 Q46 26 46 22 L42 20 Q38 18 34 20 L30 24 Z" fill="#27AE60" />
          {/* Seat/handle */}
          <Path d="M34 20 L34 16 L40 16" stroke="#1E8449" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Exhaust */}
          <Path d="M28 28 L24 30 L22 32" stroke="#8E8E9A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Wheels */}
          <Circle cx="31" cy="40" r="8" fill="#1C1C28" />
          <Circle cx="31" cy="40" r="5" fill="#333" />
          <Circle cx="31" cy="40" r="2" fill="#666" />
          <Circle cx="47" cy="40" r="8" fill="#1C1C28" />
          <Circle cx="47" cy="40" r="5" fill="#333" />
          <Circle cx="47" cy="40" r="2" fill="#666" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // GROCERY — caddie violet #8E44AD
    // ──────────────────────────────────────────────
    case 'GROCERY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Handle */}
          <Path d="M6 12 L14 12" stroke="#8E44AD" strokeWidth="3" strokeLinecap="round" />
          <Path d="M14 12 L18 22" stroke="#8E44AD" strokeWidth="3" strokeLinecap="round" />
          {/* Cart body */}
          <Path d="M18 22 L48 22 L44 40 L20 40 Z" fill="#8E44AD" />
          {/* Cart lines */}
          <Path d="M20 28 L44 28" stroke="#6C3483" strokeWidth="1" />
          <Path d="M21 34 L43 34" stroke="#6C3483" strokeWidth="1" />
          {/* Vertical bars */}
          <Path d="M27 22 L25 40" stroke="#6C3483" strokeWidth="1" />
          <Path d="M34 22 L34 40" stroke="#6C3483" strokeWidth="1" />
          <Path d="M41 22 L43 40" stroke="#6C3483" strokeWidth="1" />
          {/* Wheels */}
          <Circle cx="25" cy="46" r="4.5" fill="#8E44AD" />
          <Circle cx="25" cy="46" r="2" fill="#1C1C28" />
          <Circle cx="40" cy="46" r="4.5" fill="#8E44AD" />
          <Circle cx="40" cy="46" r="2" fill="#1C1C28" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // RESTAURANT — assiette avec cloche #F5A623
    // ──────────────────────────────────────────────
    case 'RESTAURANT':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Plate */}
          <Ellipse cx="30" cy="40" rx="22" ry="6" fill="#F5A623" />
          <Ellipse cx="30" cy="40" rx="18" ry="4" fill="#E69520" />
          {/* Dome/cloche */}
          <Path d="M12 38 Q12 20 30 20 Q48 20 48 38 Z" fill="#F5A623" />
          {/* Cloche shine */}
          <Path d="M16 32 Q18 24 26 22" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Handle on top */}
          <Rect x="26" y="14" width="8" height="7" rx="4" fill="#F5A623" />
          <Circle cx="30" cy="15" r="3" fill="#E69520" />
          {/* Fork */}
          <Path d="M6 10 L6 30" stroke="#8E8E9A" strokeWidth="2" strokeLinecap="round" />
          <Path d="M4 10 L4 16" stroke="#8E8E9A" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M8 10 L8 16" stroke="#8E8E9A" strokeWidth="1.5" strokeLinecap="round" />
          {/* Knife */}
          <Path d="M54 10 L54 30" stroke="#8E8E9A" strokeWidth="2" strokeLinecap="round" />
          <Path d="M54 10 Q56 14 56 18 L54 18" stroke="#8E8E9A" strokeWidth="1.5" fill="none" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // PHARMACY — croix verte #27AE60
    // ──────────────────────────────────────────────
    case 'PHARMACY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Background rounded square */}
          <Rect x="6" y="6" width="48" height="48" rx="10" fill="#27AE60" />
          {/* White cross */}
          <Rect x="23" y="12" width="14" height="36" rx="4" fill="#FFFFFF" />
          <Rect x="12" y="23" width="36" height="14" rx="4" fill="#FFFFFF" />
          {/* Small green cross inside for depth */}
          <Rect x="26" y="15" width="8" height="30" rx="2" fill="#27AE60" opacity="0.15" />
          <Rect x="15" y="26" width="30" height="8" rx="2" fill="#27AE60" opacity="0.15" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // BEAUTY — flacon parfum rose #E91E8C
    // ──────────────────────────────────────────────
    case 'BEAUTY':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Bottle body */}
          <Rect x="16" y="26" width="28" height="28" rx="8" fill="#E91E8C" />
          {/* Bottle neck */}
          <Rect x="22" y="18" width="16" height="10" rx="4" fill="#C2185B" />
          {/* Cap */}
          <Rect x="20" y="12" width="20" height="8" rx="4" fill="#AD1457" />
          {/* Spray nozzle */}
          <Rect x="38" y="14" width="8" height="4" rx="2" fill="#880E4F" />
          {/* Spray mist */}
          <Path d="M46 14 L52 10" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <Path d="M46 16 L53 16" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <Path d="M46 18 L52 22" stroke="#F48FB1" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          {/* Label */}
          <Rect x="20" y="32" width="20" height="14" rx="3" fill="#FFFFFF" opacity="0.25" />
          {/* Shine */}
          <Path d="M20 30 Q22 26 26 28" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // PETS — patte animale #F5A623
    // ──────────────────────────────────────────────
    case 'PETS':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Main paw pad */}
          <Ellipse cx="30" cy="38" rx="14" ry="12" fill="#F5A623" />
          {/* Toe pads */}
          <Ellipse cx="18" cy="26" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="27" cy="22" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="36" cy="22" rx="6" ry="7" fill="#F5A623" />
          <Ellipse cx="44" cy="26" rx="6" ry="7" fill="#F5A623" />
          {/* Darker inner pads */}
          <Ellipse cx="18" cy="26" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="27" cy="22" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="36" cy="22" rx="4" ry="5" fill="#E69520" />
          <Ellipse cx="44" cy="26" rx="4" ry="5" fill="#E69520" />
          {/* Main pad shine */}
          <Ellipse cx="26" cy="34" rx="5" ry="4" fill="#E69520" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // HIGHTECH — smartphone / circuit #2196F3
    // ──────────────────────────────────────────────
    case 'HIGHTECH':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Phone body */}
          <Rect x="16" y="6" width="28" height="48" rx="6" fill="#2196F3" />
          <Rect x="18" y="8" width="24" height="44" rx="4" fill="#1565C0" />
          {/* Screen */}
          <Rect x="20" y="12" width="20" height="32" rx="3" fill="#0D47A1" />
          {/* Screen content - circuit lines */}
          <Path d="M24 18 L36 18 L36 22 L30 22 L30 28 L36 28" stroke="#2196F3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M24 28 L27 28 L27 34 L36 34" stroke="#2196F3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Circle cx="24" cy="18" r="2" fill="#64B5F6" />
          <Circle cx="36" cy="28" r="2" fill="#64B5F6" />
          <Circle cx="36" cy="34" r="2" fill="#64B5F6" />
          <Circle cx="24" cy="28" r="2" fill="#64B5F6" />
          {/* Home button */}
          <Circle cx="30" cy="50" r="3" fill="#1565C0" />
          <Circle cx="30" cy="50" r="1.5" fill="#2196F3" />
          {/* Speaker */}
          <Rect x="26" y="10" width="8" height="2" rx="1" fill="#2196F3" />
        </Svg>
      );

    // ──────────────────────────────────────────────
    // ELECTRO — éclair dans carré #F5A623
    // ──────────────────────────────────────────────
    case 'ELECTRO':
      return (
        <Svg width={s} height={s} viewBox={vb}>
          {/* Background square */}
          <Rect x="6" y="6" width="48" height="48" rx="10" fill="#F5A623" />
          {/* Lightning bolt */}
          <Path
            d="M34 8 L20 32 L28 32 L26 52 L42 26 L34 26 Z"
            fill="#0A0A0F"
          />
          {/* Inner highlight */}
          <Path
            d="M34 14 L24 32 L30 32 L28 46 L38 28 L32 28 Z"
            fill="#F5A623"
            opacity="0.3"
          />
        </Svg>
      );

    // Fallback
    default:
      return (
        <Svg width={s} height={s} viewBox={vb}>
          <Rect x="6" y="6" width="48" height="48" rx="10" fill="#2A2A3A" />
          <Path d="M22 30 L30 20 L38 30 L34 30 L34 40 L26 40 L26 30 Z" fill="#8E8E9A" />
        </Svg>
      );
  }
}
