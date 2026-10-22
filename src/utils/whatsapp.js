/**
 * Normalizes phone number into international digits-only format.
 * Defaults to country code 91 (India) if standard 10-digit number is provided.
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Builds the exact human-readable WhatsApp message format specified in the prompt.
 */
export function buildWhatsAppOrderMessage({
  shopName,
  orderReference,
  customerName,
  customerMobile,
  orderType,
  items,
  total,
  address,
  notes
}) {
  const cleanMobile = customerMobile ? String(customerMobile).replace(/^\+/, '').trim() : '';
  const lines = [
    `Hello ${shopName}!`,
    `I would like to place an order.`,
    ``,
    `Order Reference: ${orderReference}`,
    `Customer Name: ${customerName}`,
    `Mobile: ${cleanMobile}`,
    ``,
    `Items:`
  ];

  items.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    lines.push(`• ${item.name} x ${item.quantity} — ₹${item.price} each = ₹${itemSubtotal}`);
  });

  lines.push(``);
  lines.push(`Estimated Total: ₹${total}`);
  lines.push(`Order Type: ${orderType || 'Shop Pickup'}`);

  if (orderType === 'Delivery' && address) {
    lines.push(`Delivery Address: ${address}`);
  }

  if (notes && notes.trim().length > 0) {
    lines.push(`Notes: ${notes}`);
  }

  lines.push(``);
  lines.push(`Please confirm availability. Thank you!`);

  return lines.join('\n');
}

/**
 * Generates the WhatsApp Click-to-Chat URL
 */
export function getWhatsAppUrl(phoneNumber, message) {
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedNumber}?text=${encodedText}`;
}
