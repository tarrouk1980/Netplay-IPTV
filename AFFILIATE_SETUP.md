# EasyHotels Maghreb — Affiliate Setup Guide

## 4 Affiliate Programs

### 1. Booking.com Partner Hub
- URL: https://partnerhelp.booking.com
- CPC range: 0.25€ – 2.00€ per click
- Approval: 2–5 business days
- Env var: `BOOKING_AFFILIATE_ID=XXXXXXX`

### 2. Expedia Affiliate Network (RCNA)
- URL: https://affiliates.expedia.com
- CPC range: 0.20€ – 1.80€ per click
- Approval: 3–7 business days
- Env var: `EXPEDIA_AFFILIATE_ID=XXXXXXX`

### 3. Hotels.com Affiliate Program
- URL: https://affiliates.expedia.com (same EAN network)
- CPC range: 0.15€ – 1.50€ per click
- Approval: same as Expedia (EAN account — select Hotels.com property)
- Env var: `HOTELSCOM_AFFILIATE_ID=XXXXXXX`

### 4. TripAdvisor Affiliate Program
- URL: https://www.tripadvisor.com/affiliates
- CPC range: 0.10€ – 0.80€ per click
- Approval: 5–10 business days
- Env var: `TRIPADVISOR_AFFILIATE_ID=XXXXXXX`

## Revenue Benchmarks

**RPM (Revenue per 1,000 visitors): 8–25€ depending on EU country**

| Market | CTR | CPC avg | RPM est. |
|--------|-----|---------|----------|
| France (diaspora) | 4.2% (×1.4 vs avg) | 0.85€ | 35€ |
| Espagne | 3.5% | 0.80€ | 28€ |
| Belgique | 3.8% | 0.75€ | 28€ |
| Italie | 2.9% | 0.70€ | 20€ |
| Allemagne | 2.4% | 0.65€ | 15€ |

> France diaspora benchmark: CTR 4.2% — **×1.4 vs average** (3.0%)

## Quick Revenue Projection

| Monthly visitors | CTR 3% | Revenue (0.80€ CPC) |
|------------------|--------|----------------------|
| 10,000 | 300 clicks | ~240€/mois |
| 50,000 | 1,500 clicks | ~1,200€/mois |
| 100,000 | 3,000 clicks | ~2,400€/mois |

## .env Configuration

```bash
# --- Affiliate IDs ---
BOOKING_AFFILIATE_ID=XXXXXXX
EXPEDIA_AFFILIATE_ID=XXXXXXX
HOTELSCOM_AFFILIATE_ID=XXXXXXX
TRIPADVISOR_AFFILIATE_ID=XXXXXXX
```

Place these in `/web/.env` (never commit to git — already in `.gitignore`).

## Admin Pages
- Affiliate setup checklist: `/setup/affiliates`
- Revenue dashboard: `/admin`
- French hotelier landing: `/fr/hoteliers`
