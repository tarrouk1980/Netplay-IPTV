'use strict';

const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------
const t = {
  fr: {
    priceAlert: 'Alerte prix !',
    saving: 'Vous économisez',
    viewOffer: "Voir l'offre →",
    goodNews: 'Bonne nouvelle ! Le prix de',
    hasFallen: 'a baissé',
    oldPrice: 'Ancien prix',
    newPrice: 'Nouveau prix',
    welcomeSubject: 'Bienvenue sur EasyHotels Maghreb 🏨',
    welcomeTitle: 'Bienvenue',
    welcomeBody: 'Votre compte EasyHotels Maghreb est prêt. Comparez les meilleurs prix d\'hôtels pour votre prochain voyage au Maghreb.',
    newsletterSubject: 'Vos offres flash EasyHotels cette semaine 🔥',
    newsletterTitle: 'Offres de la semaine',
    bookingSubject: 'Confirmation de réservation',
    bookingTitle: 'Réservation confirmée',
    checkin: 'Arrivée',
    checkout: 'Départ',
    provider: 'Réservé via',
    unsubscribe: 'Se désabonner',
    rgpd: 'Conformément au RGPD, vous pouvez exercer vos droits à tout moment.',
    halal: '🌙 Halal certifié',
    noAlcohol: '🚫 Sans alcool',
    cta: "Voir l'offre maintenant →",
    dealsTitle: 'Meilleures offres',
    from: 'Dès',
  },
  es: {
    priceAlert: '¡Alerta de precio!',
    saving: 'Ahorras',
    viewOffer: 'Ver la oferta →',
    goodNews: '¡Buena noticia! El precio de',
    hasFallen: 'ha bajado',
    oldPrice: 'Precio anterior',
    newPrice: 'Nuevo precio',
    welcomeSubject: 'Bienvenido a EasyHotels Maghreb 🏨',
    welcomeTitle: 'Bienvenido',
    welcomeBody: 'Tu cuenta en EasyHotels Maghreb está lista. Compara los mejores precios de hoteles para tu próximo viaje al Magreb.',
    newsletterSubject: 'Tus ofertas flash EasyHotels esta semana 🔥',
    newsletterTitle: 'Ofertas de la semana',
    bookingSubject: 'Confirmación de reserva',
    bookingTitle: 'Reserva confirmada',
    checkin: 'Llegada',
    checkout: 'Salida',
    provider: 'Reservado a través de',
    unsubscribe: 'Cancelar suscripción',
    rgpd: 'De acuerdo con el RGPD, puede ejercer sus derechos en cualquier momento.',
    halal: '🌙 Halal certificado',
    noAlcohol: '🚫 Sin alcohol',
    cta: 'Ver la oferta ahora →',
    dealsTitle: 'Mejores ofertas',
    from: 'Desde',
  },
};

// ---------------------------------------------------------------------------
// Transporter factory
// ---------------------------------------------------------------------------
let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[EmailService] Using Ethereal test account:', testAccount.user);
  }

  return _transporter;
}

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------
function emailWrapper(bodyHtml, lang = 'fr') {
  const tr = t[lang] || t.fr;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EasyHotels Maghreb</title>
</head>
<body style="margin:0;padding:0;background:#F4F6F8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#FF6B35;padding:24px 32px;text-align:center;">
            <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">🏨 EasyHotels Maghreb</span>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Comparateur de prix pour la diaspora maghrébine</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8F9FA;padding:20px 32px;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#718096;">
              <a href="https://easyhotels.maghreb.com/unsubscribe?email={{email}}&token={{token}}" style="color:#FF6B35;text-decoration:underline;">${tr.unsubscribe}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#A0AEC0;">${tr.rgpd}<br/>
              © ${new Date().getFullYear()} EasyHotels Maghreb ·
              <a href="https://easyhotels.maghreb.com/privacy" style="color:#A0AEC0;">Politique de confidentialité</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// sendWelcomeEmail
// ---------------------------------------------------------------------------
async function sendWelcomeEmail(to, name, lang = 'fr') {
  const tr = t[lang] || t.fr;
  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#004E89;">${tr.welcomeTitle}, ${name} ! 🎉</h1>
    <p style="margin:0 0 24px;color:#718096;font-size:15px;">${tr.welcomeBody}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="text-align:center;">
          <a href="https://easyhotels.maghreb.com/hotels" style="display:inline-block;background:#FF6B35;color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">${tr.viewOffer}</a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="33%" style="text-align:center;padding:12px;background:#FFF5F0;border-radius:8px;">
          <div style="font-size:24px;">🇲🇦</div>
          <div style="font-size:12px;font-weight:700;color:#004E89;margin-top:6px;">Maroc</div>
        </td>
        <td width="4%"></td>
        <td width="33%" style="text-align:center;padding:12px;background:#FFF5F0;border-radius:8px;">
          <div style="font-size:24px;">🇩🇿</div>
          <div style="font-size:12px;font-weight:700;color:#004E89;margin-top:6px;">Algérie</div>
        </td>
        <td width="4%"></td>
        <td width="33%" style="text-align:center;padding:12px;background:#FFF5F0;border-radius:8px;">
          <div style="font-size:24px;">🇹🇳</div>
          <div style="font-size:12px;font-weight:700;color:#004E89;margin-top:6px;">Tunisie</div>
        </td>
      </tr>
    </table>
  `;
  const html = emailWrapper(body, lang);
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: `"EasyHotels Maghreb" <${process.env.SMTP_USER || 'noreply@easyhotels.maghreb.com'}>`,
    to,
    subject: tr.welcomeSubject,
    html,
  });
  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// ---------------------------------------------------------------------------
// sendPriceAlertEmail
// ---------------------------------------------------------------------------
async function sendPriceAlertEmail(to, hotel, oldPrice, newPrice, currency = 'EUR', lang = 'fr') {
  const tr = t[lang] || t.fr;
  const saving = Math.round(oldPrice - newPrice);
  const pct = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  const culturalBadges = [];
  if (hotel.isHalal) culturalBadges.push(tr.halal);
  if (hotel.noAlcohol || hotel.isHalal) culturalBadges.push(tr.noAlcohol);

  const badgesHtml = culturalBadges.length
    ? `<div style="margin:16px 0;">${culturalBadges.map(b => `<span style="display:inline-block;background:#EBF8FF;color:#004E89;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin-right:6px;border:1px solid #BEE3F8;">${b}</span>`).join('')}</div>`
    : '';

  const body = `
    <div style="background:#FFF5F0;border-left:4px solid #FF6B35;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <span style="font-size:16px;font-weight:800;color:#FF6B35;">🔔 ${tr.priceAlert}</span>
    </div>
    <p style="font-size:17px;color:#2D3748;font-weight:600;margin:0 0 20px;">${tr.goodNews} <strong>${hotel.name}</strong> ${tr.hasFallen} !</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="48%" style="text-align:center;background:#F7FAFC;border-radius:10px;padding:20px;border:1px solid #E2E8F0;">
          <div style="font-size:11px;color:#A0AEC0;font-weight:700;letter-spacing:0.5px;margin-bottom:8px;">${tr.oldPrice}</div>
          <div style="font-size:24px;font-weight:900;color:#A0AEC0;text-decoration:line-through;">${oldPrice} ${currency}</div>
        </td>
        <td width="4%" style="text-align:center;font-size:20px;color:#FF6B35;">→</td>
        <td width="48%" style="text-align:center;background:#FFF5F0;border-radius:10px;padding:20px;border:2px solid #FF6B35;">
          <div style="font-size:11px;color:#FF6B35;font-weight:700;letter-spacing:0.5px;margin-bottom:8px;">${tr.newPrice}</div>
          <div style="font-size:32px;font-weight:900;color:#FF6B35;">${newPrice} ${currency}</div>
        </td>
      </tr>
    </table>

    <div style="text-align:center;background:#E8F5E9;border-radius:10px;padding:14px;margin-bottom:20px;">
      <span style="font-size:18px;font-weight:900;color:#2E7D32;">🎉 ${tr.saving} <strong>${saving} ${currency}</strong> (${pct}% de réduction) !</span>
    </div>

    ${badgesHtml}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="text-align:center;">
          <a href="${hotel.url || 'https://easyhotels.maghreb.com/hotels'}" style="display:inline-block;background:#FF6B35;color:#fff;font-weight:800;font-size:16px;padding:16px 36px;border-radius:12px;text-decoration:none;">${tr.cta}</a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#A0AEC0;text-align:center;margin:0;">Cette offre peut expirer à tout moment.</p>
  `;

  const html = emailWrapper(body, lang);
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: `"EasyHotels Maghreb" <${process.env.SMTP_USER || 'noreply@easyhotels.maghreb.com'}>`,
    to,
    subject: `${tr.priceAlert} ${hotel.name} — ${newPrice} ${currency}/nuit`,
    html,
  });
  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// ---------------------------------------------------------------------------
// sendNewsletterEmail
// ---------------------------------------------------------------------------
async function sendNewsletterEmail(to, deals, lang = 'fr') {
  const tr = t[lang] || t.fr;
  const topDeals = (deals || []).slice(0, 3);

  const dealCards = topDeals.map(d => `
    <td width="33%" style="padding:0 6px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr>
          <td>
            <img src="${d.image || 'https://picsum.photos/200/130?random=' + Math.floor(Math.random()*100)}" width="100%" height="130" style="object-fit:cover;display:block;" alt="${d.name}" />
          </td>
        </tr>
        <tr>
          <td style="padding:12px;">
            <div style="font-size:13px;font-weight:800;color:#1A202C;margin-bottom:4px;">${d.name}</div>
            <div style="font-size:11px;color:#718096;margin-bottom:8px;">📍 ${d.city || ''}</div>
            <div style="font-size:11px;color:#A0AEC0;text-decoration:line-through;">${d.oldPrice ? d.oldPrice + ' €' : ''}</div>
            <div style="font-size:18px;font-weight:900;color:#FF6B35;">${tr.from} ${d.price || d.newPrice} €</div>
            <a href="${d.url || 'https://easyhotels.maghreb.com/hotels'}" style="display:block;text-align:center;background:#004E89;color:#fff;font-weight:700;font-size:12px;padding:8px;border-radius:7px;text-decoration:none;margin-top:8px;">${tr.viewOffer}</a>
          </td>
        </tr>
      </table>
    </td>
  `).join('');

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#004E89;">${tr.newsletterTitle} 🔥</h1>
    <p style="margin:0 0 24px;color:#718096;font-size:14px;">Les meilleures offres sélectionnées pour vous cette semaine.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>${dealCards}</tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;">
          <a href="https://easyhotels.maghreb.com/hotels" style="display:inline-block;background:#FF6B35;color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">Voir toutes les offres →</a>
        </td>
      </tr>
    </table>
  `;

  const html = emailWrapper(body, lang);
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: `"EasyHotels Maghreb" <${process.env.SMTP_USER || 'noreply@easyhotels.maghreb.com'}>`,
    to,
    subject: tr.newsletterSubject,
    html,
  });
  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// ---------------------------------------------------------------------------
// sendBookingConfirmationEmail
// ---------------------------------------------------------------------------
async function sendBookingConfirmationEmail(to, hotel, checkin, checkout, provider, lang = 'fr') {
  const tr = t[lang] || t.fr;
  const nights = Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / 86400000));

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#E8F5E9;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">✅</div>
    </div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#004E89;text-align:center;">${tr.bookingTitle} !</h1>
    <p style="margin:0 0 24px;color:#718096;font-size:14px;text-align:center;">Votre réservation a été confirmée avec succès.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFC;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;">
          <span style="font-size:12px;color:#A0AEC0;font-weight:700;display:block;margin-bottom:2px;">HÔTEL</span>
          <span style="font-size:16px;font-weight:800;color:#1A202C;">${hotel.name}</span>
          <span style="font-size:13px;color:#718096;display:block;">📍 ${hotel.city || ''}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding:16px 20px;border-right:1px solid #E2E8F0;">
                <span style="font-size:11px;color:#A0AEC0;font-weight:700;display:block;margin-bottom:4px;">${tr.checkin.toUpperCase()}</span>
                <span style="font-size:15px;font-weight:800;color:#004E89;">${checkin}</span>
              </td>
              <td width="50%" style="padding:16px 20px;">
                <span style="font-size:11px;color:#A0AEC0;font-weight:700;display:block;margin-bottom:4px;">${tr.checkout.toUpperCase()}</span>
                <span style="font-size:15px;font-weight:800;color:#004E89;">${checkout}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-top:1px solid #E2E8F0;">
          <span style="font-size:12px;color:#A0AEC0;font-weight:700;display:block;margin-bottom:2px;">DURÉE</span>
          <span style="font-size:15px;font-weight:700;color:#2D3748;">${nights} nuit${nights > 1 ? 's' : ''}</span>
        </td>
      </tr>
      ${provider ? `
      <tr>
        <td style="padding:16px 20px;border-top:1px solid #E2E8F0;">
          <span style="font-size:12px;color:#A0AEC0;font-weight:700;display:block;margin-bottom:2px;">${tr.provider.toUpperCase()}</span>
          <span style="font-size:15px;font-weight:700;color:#2D3748;">${provider}</span>
        </td>
      </tr>` : ''}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;">
          <a href="https://easyhotels.maghreb.com/bookings" style="display:inline-block;background:#004E89;color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">Voir ma réservation →</a>
        </td>
      </tr>
    </table>
  `;

  const html = emailWrapper(body, lang);
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: `"EasyHotels Maghreb" <${process.env.SMTP_USER || 'noreply@easyhotels.maghreb.com'}>`,
    to,
    subject: `${tr.bookingSubject} — ${hotel.name}`,
    html,
  });
  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

module.exports = {
  sendWelcomeEmail,
  sendPriceAlertEmail,
  sendNewsletterEmail,
  sendBookingConfirmationEmail,
};
