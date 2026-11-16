// Netlify Forms submission-created event: customer acknowledgments for supported HBLE forms.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  let submission;
  try { submission = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const data = submission.payload?.data || submission.data || {};
  const formName = submission.payload?.form_name || submission.form_name || data['form-name'];
  const email = String(data.email || '').trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Diagnostics intentionally omit email addresses, submitted content, and secrets.
  console.log('HBLE email: submission received', { formName: formName || '(missing)', hasEmail: Boolean(email), validEmail });
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let subject, message;

  if (formName === 'hble-music-downloads') {
    const song = String(data.song || '').trim().slice(0, 120);
    if (!validEmail || !song) {
      console.warn('HBLE email: invalid music download submission', { validEmail, hasSong: Boolean(song) });
      return { statusCode: 400, body: 'Missing download details' };
    }
    subject = 'Thank you for supporting HBLE Music!';
    message = 'Thank you for downloading <strong>' + escapeHtml(song) + '</strong>. We appreciate your support of HBLE Radio and independent creativity.';
  } else if (formName === 'hble-project-inquiry') {
    if (!validEmail) {
      console.warn('HBLE email: invalid project inquiry email');
      return { statusCode: 400, body: 'Missing inquiry email' };
    }
    const name = String(data.name || '').trim().slice(0, 100);
    subject = 'HBLE Studios — We received your inquiry';
    message = 'Hello' + (name ? ' ' + escapeHtml(name) : '') + ',<br><br>Thank you for contacting HBLE Studios. We received your project or support request and will review the details. Our team will follow up using the contact information you provided. This acknowledgment is not a project acceptance, quote, or payment confirmation.';
  } else {
    console.log('HBLE email: ignored unsupported form', formName || '(missing)');
    return { statusCode: 200, body: 'Ignored unsupported form' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.HBLE_EMAIL_FROM;
  if (!apiKey || !sender) {
    console.error('HBLE email: missing Resend configuration', { hasApiKey: Boolean(apiKey), hasSender: Boolean(sender) });
    return { statusCode: 503, body: 'Email service not configured' };
  }

  try {
    console.log('HBLE email: requesting Resend acknowledgment', { formName });
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [email],
        subject,
        html: '<div style="font-family:Arial,sans-serif;background:#14110c;color:#f7ecd9;padding:30px"><h1 style="color:#d8b170">HBLE Studios</h1><p>' + message + '</p><p>Visit <a style="color:#d8b170" href="https://hble.org">hble.org</a>.</p><p>Humble Beginnings. Legendary Endings.<br>— The HBLE Team</p></div>',
        text: formName === 'hble-music-downloads'
          ? 'Thank you for supporting HBLE Music. We appreciate your download. Visit https://hble.org.'
          : 'Thank you for contacting HBLE Studios. We received your inquiry and will review it. Our team will follow up using your contact information. Visit https://hble.org.'
      })
    });
    if (!response.ok) {
      console.error('HBLE email: Resend rejected request', { status: response.status, formName });
      return { statusCode: 502, body: 'Email delivery request failed' };
    }
    console.log('HBLE email: accepted by Resend for form', formName);
    return { statusCode: 200, body: 'Acknowledgment email requested' };
  } catch (error) {
    console.error('HBLE email: request failed', error?.name || 'Unknown error');
    return { statusCode: 502, body: 'Email service request failed' };
  }
};
