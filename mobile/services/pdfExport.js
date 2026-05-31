import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('fr-TN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrice(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : n.toFixed(3) + ' TND';
}

function buildReceiptHTML(order) {
  const status = {
    COMPLETED: 'Terminée', CANCELLED: 'Annulée',
    IN_PROGRESS: 'En cours', PENDING: 'En attente', ACCEPTED: 'Acceptée',
  }[order.status] || order.status;

  const typeIcon = { TAXI: '🚕', SOS: '🚑', DELIVERY: '🛵', GROCERY: '🛒' }[order.type] || '🚗';

  const rows = [
    ['Service', `${typeIcon} ${order.type || ''}`],
    ['Statut', status],
    ['Date', formatDate(order.createdAt)],
    ['Référence', (order.id || '').slice(0, 16).toUpperCase()],
    ['Départ', order.pickupAddress || '—'],
    ['Arrivée', order.destAddress || '—'],
    order.distance != null ? ['Distance', `${order.distance} km`] : null,
    order.duration != null ? ['Durée', `${order.duration} min`] : null,
    order.fareBase != null ? ['Tarif de base', formatPrice(order.fareBase)] : null,
    order.fareDistance != null ? ['Supplément distance', formatPrice(order.fareDistance)] : null,
    order.discount && order.discount > 0 ? ['Remise', `- ${formatPrice(order.discount)}`] : null,
    ['<b>Total</b>', `<b>${formatPrice(order.price ?? order.fare)}</b>`],
    ['Mode de paiement', order.paymentMethod || 'Espèces'],
    order.driver?.name ? ['Chauffeur', order.driver.name] : null,
  ].filter(Boolean);

  const rowsHTML = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;color:#888;font-size:13px;width:40%">${label}</td>
      <td style="padding:8px 12px;color:#fff;font-size:13px">${value}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reçu EASYWAY</title>
  <style>
    body { background:#0A0A0F; font-family:'Helvetica Neue',Arial,sans-serif; margin:0; padding:24px; color:#fff; }
    .card { background:#1C1C28; border-radius:16px; padding:24px; max-width:480px; margin:0 auto; }
    .brand { text-align:center; margin-bottom:24px; }
    .brand-name { font-size:28px; font-weight:900; color:#F5A623; letter-spacing:2px; }
    .brand-sub { font-size:12px; color:#8E8E9A; margin-top:4px; }
    .divider { border:none; border-top:1px solid #2C2C3A; margin:16px 0; }
    table { width:100%; border-collapse:collapse; }
    .footer { text-align:center; margin-top:24px; color:#4A4A5A; font-size:11px; line-height:1.6; }
    .total-row td { border-top:1px solid #2C2C3A; padding-top:12px!important; font-size:15px!important; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <div class="brand-name">EASYWAY</div>
      <div class="brand-sub">Reçu de course</div>
    </div>
    <hr class="divider"/>
    <table>${rowsHTML}</table>
    <hr class="divider"/>
    <div class="footer">
      EASYWAY — www.easyway.tn<br/>
      © 2025 EASYWAY. Tous droits réservés.<br/>
      Ce reçu est généré automatiquement et fait foi de paiement.
    </div>
  </div>
</body>
</html>`;
}

function buildInvoiceHTML(invoice, company) {
  const now = new Date().toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = (invoice.items || []).map((item, i) => `
    <tr>
      <td style="padding:8px 12px;color:#fff;font-size:13px">${item.label || `Article ${i + 1}`}</td>
      <td style="padding:8px 12px;color:#F5A623;font-size:13px;text-align:right">${formatPrice(item.amount)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture EASYWAY Business</title>
  <style>
    body { background:#0A0A0F; font-family:'Helvetica Neue',Arial,sans-serif; margin:0; padding:24px; color:#fff; }
    .card { background:#1C1C28; border-radius:16px; padding:32px; max-width:560px; margin:0 auto; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
    .brand-name { font-size:24px; font-weight:900; color:#F5A623; }
    .invoice-meta { text-align:right; }
    .invoice-num { font-size:18px; font-weight:700; }
    .invoice-date { color:#8E8E9A; font-size:12px; margin-top:4px; }
    .company-block { background:#12121C; border-radius:12px; padding:16px; margin-bottom:24px; }
    .company-name { font-size:16px; font-weight:700; }
    .company-detail { color:#8E8E9A; font-size:12px; margin-top:4px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#252535; padding:10px 12px; text-align:left; font-size:12px; color:#8E8E9A; text-transform:uppercase; letter-spacing:0.5px; }
    .divider { border:none; border-top:1px solid #2C2C3A; margin:16px 0; }
    .total-row { font-size:18px; font-weight:700; color:#F5A623; }
    .footer { text-align:center; margin-top:24px; color:#4A4A5A; font-size:11px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand-name">EASYWAY</div>
        <div style="color:#8E8E9A;font-size:12px;margin-top:4px">Business</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-num">Facture #${(invoice.id || Date.now()).toString().slice(-6)}</div>
        <div class="invoice-date">Émise le ${now}</div>
        <div class="invoice-date">Période : ${invoice.period || now}</div>
      </div>
    </div>
    <div class="company-block">
      <div class="company-name">${company?.name || 'Entreprise'}</div>
      <div class="company-detail">${company?.taxId ? `MF : ${company.taxId}` : ''}</div>
      <div class="company-detail">${company?.email || ''}</div>
    </div>
    <table>
      <tr><th>Description</th><th style="text-align:right">Montant</th></tr>
      ${rows}
    </table>
    <hr class="divider"/>
    <table>
      <tr class="total-row">
        <td style="padding:8px 12px">Total TTC</td>
        <td style="padding:8px 12px;text-align:right">${formatPrice(invoice.total)}</td>
      </tr>
    </table>
    <hr class="divider"/>
    <div class="footer">
      EASYWAY SRL — Tunis, Tunisie<br/>
      contact@easyway.tn — www.easyway.tn<br/>
      © 2025 EASYWAY. Tous droits réservés.
    </div>
  </div>
</body>
</html>`;
}

export async function exportReceiptPDF(order) {
  const html = buildReceiptHTML(order);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Reçu EASYWAY',
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}

export async function exportInvoicePDF(invoice, company) {
  const html = buildInvoiceHTML(invoice, company);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Facture EASYWAY Business`,
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}
