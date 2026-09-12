/**
 * WhatsApp Cloud API Service
 * Handles customer booking confirmation and owner notification messages.
 */

/**
 * Safely normalizes phone numbers.
 * Supports Indian formats (+91, 0, 91, 10-digit) and standard international numbers.
 *
 * @param {string|number} value
 * @returns {string} Digits-only normalized phone number with country code.
 */
export function normalizePhone(value) {
  if (!value) return '';
  let digits = String(value).replace(/\D/g, '');

  // 10-digit Indian mobile numbers starting with 6, 7, 8, 9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `91${digits}`;
  }

  // 11-digit numbers with leading 0 (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(digits)) {
    return `91${digits.slice(1)}`;
  }

  // 12-digit Indian numbers starting with 91
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return digits;
  }

  // International or other valid numbers
  return digits;
}

/**
 * Returns WhatsApp Cloud API config from environment without exposing secrets.
 */
function getApiConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

  if (!token || !phoneId) {
    return null;
  }

  return { token, phoneId, version };
}

/**
 * Sends a plain text WhatsApp message via Meta Cloud API.
 *
 * @param {string} to - Recipient phone number
 * @param {string} body - Text content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string, code?: number}>}
 */
export async function sendWhatsAppMessage(to, body) {
  const config = getApiConfig();
  if (!config) {
    console.warn('[whatsapp] Cloud API not configured (missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID).');
    return { success: false, error: 'WhatsApp Cloud API is not configured.' };
  }

  const recipient = normalizePhone(to);
  if (!recipient || recipient.length < 8) {
    console.warn(`[whatsapp] Invalid phone number provided: "${to}"`);
    return { success: false, error: 'Invalid recipient phone number.' };
  }

  try {
    const url = `https://graph.facebook.com/${config.version}/${config.phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body }
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = data?.error || {};
      const code = err.code;

      if (response.status === 401 || code === 190) {
        console.error('[whatsapp] ERROR: WhatsApp access token is invalid or expired. Update WHATSAPP_ACCESS_TOKEN in .env.');
        return { success: false, error: 'WhatsApp authentication failed. Token expired or invalid.', code };
      }

      if (code === 131047) {
        console.warn(`[whatsapp] Notice: 24-hour service window closed for ${recipient}. A Meta-approved template is required for business-initiated messages.`);
        return { success: false, error: '24-hour window closed. Template required.', code };
      }

      console.error(`[whatsapp] API send failed (${response.status}): ${err.message || 'Unknown error'} (code: ${code || 'none'})`);
      return { success: false, error: err.message || 'WhatsApp API request failed.', code };
    }

    const messageId = data?.messages?.[0]?.id;
    return { success: true, messageId, data };
  } catch (networkError) {
    console.error('[whatsapp] Network error sending WhatsApp message:', networkError.message || networkError);
    return { success: false, error: networkError.message || 'Network error communicating with WhatsApp API.' };
  }
}

/**
 * Sends a template WhatsApp message via Meta Cloud API.
 *
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Approved Meta template name
 * @param {string} languageCode - Language code (e.g. 'en_US' or 'en')
 * @param {Array} components - Template components
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendWhatsAppTemplate(to, templateName, languageCode = 'en_US', components = []) {
  const config = getApiConfig();
  if (!config) {
    return { success: false, error: 'WhatsApp Cloud API is not configured.' };
  }

  const recipient = normalizePhone(to);
  if (!recipient || recipient.length < 8) {
    return { success: false, error: 'Invalid recipient phone number.' };
  }

  try {
    const url = `https://graph.facebook.com/${config.version}/${config.phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components
        }
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = data?.error || {};
      console.error(`[whatsapp] Template send failed (${response.status}): ${err.message || 'Unknown error'}`);
      return { success: false, error: err.message || 'Template send failed.', code: err.code };
    }

    return { success: true, messageId: data?.messages?.[0]?.id, data };
  } catch (err) {
    console.error('[whatsapp] Template network error:', err.message || err);
    return { success: false, error: err.message || 'Network error.' };
  }
}

/**
 * Sends a booking confirmation message to the customer.
 *
 * @param {Object} details
 * @param {string} details.phone - Customer phone
 * @param {string} details.name - Customer name
 * @param {string} details.projectName - Project or property title
 * @param {string} details.date - Booking date
 * @param {string} details.time - Booking time
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendBookingConfirmationToCustomer({ phone, name, projectName, date, time }) {
  const templateName = process.env.WHATSAPP_BOOKING_TEMPLATE_NAME;
  const lang = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';

  const customerName = name || 'Customer';
  const project = projectName || 'VR Real Estate Property';
  const visitDate = date || 'Preferred date';
  const visitTime = time || 'Scheduled time';

  // If a template is configured, try template first
  if (templateName) {
    console.log(`[whatsapp] sending customer confirmation using template: "${templateName}"`);
    const templateResult = await sendWhatsAppTemplate(phone, templateName, lang, [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: project },
          { type: 'text', text: visitDate },
          { type: 'text', text: visitTime }
        ]
      }
    ]);

    if (templateResult.success) {
      return templateResult;
    }

    console.warn('[whatsapp] template send failed, attempting text message fallback...');
  }

  // Plain text confirmation
  const messageBody =
    `*VR REAL ESTATE – BOOKING CONFIRMATION*\n\n` +
    `Hello ${customerName},\n\n` +
    `Your site visit / booking request has been received successfully!\n\n` +
    `📍 *Project / Property:* ${project}\n` +
    `📅 *Preferred Date:* ${visitDate}\n` +
    `⏰ *Preferred Time:* ${visitTime}\n\n` +
    `Our team will contact you shortly to confirm your visit.\n\n` +
    `Thank you,\n` +
    `*VR Real Estate Team*`;

  return sendWhatsAppMessage(phone, messageBody);
}

/**
 * Sends an alert to the owner/admin when a new booking is submitted.
 *
 * @param {Object} details
 * @param {string} details.customerName
 * @param {string} details.customerPhone
 * @param {string} [details.customerEmail]
 * @param {string} details.projectName
 * @param {string} details.date
 * @param {string} details.time
 * @param {string} [details.notes]
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendBookingNotificationToOwner({
  customerName,
  customerPhone,
  customerEmail,
  projectName,
  date,
  time,
  notes
}) {
  const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;
  if (!ownerPhone) {
    console.log('[whatsapp] WHATSAPP_OWNER_PHONE not configured in .env, skipping owner notification.');
    return { success: false, error: 'Owner phone not configured.' };
  }

  const messageBody =
    `*VR REAL ESTATE – NEW WEBSITE BOOKING* 🔔\n\n` +
    `A new site visit / booking has been requested on the website.\n\n` +
    `👤 *Customer:* ${customerName || 'N/A'}\n` +
    `📱 *Phone:* ${customerPhone}\n` +
    `${customerEmail ? `✉️ *Email:* ${customerEmail}\n` : ''}` +
    `🏡 *Project / Property:* ${projectName || 'General Site Visit'}\n` +
    `📅 *Preferred Date:* ${date || 'N/A'}\n` +
    `⏰ *Preferred Time:* ${time || 'N/A'}\n` +
    `${notes ? `💬 *Details:* ${notes}\n` : ''}\n` +
    `👉 *Action:* Please open the CRM *Bookings* section to *Confirm* this site visit and notify the customer.`;

  return sendWhatsAppMessage(ownerPhone, messageBody);
}
