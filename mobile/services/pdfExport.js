// NOTE: PDF generation is not yet implemented (no expo-print/expo-sharing
// dependency wired up). These previously returned `null` silently, which
// looked like a successful no-op to callers and hid the fact that nothing
// was actually exported/shared. Throwing here lets callers' existing
// error handling (Alert/toast) surface a real failure to the user instead
// of silently pretending the export succeeded.
export async function exportReceiptPDF(order) {
  throw new Error('Export PDF non disponible pour le moment.');
}

export async function exportInvoicePDF(invoice, company) {
  throw new Error('Export PDF non disponible pour le moment.');
}
