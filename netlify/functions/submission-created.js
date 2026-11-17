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

  // Email-safe, responsive layout with HBLE's black-and-gold identity.
  const isMusic = formName === 'hble-music-downloads';
  const destination = isMusic ? 'https://hble.org/radio.html' : 'https://hble.org/';
  const cta = isMusic ? 'RETURN TO HBLE RADIO' : 'EXPLORE HBLE STUDIOS';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f6f0e6;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0b0b"><tr><td align="center" style="padding:36px 14px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#141414;border:1px solid #866a38;border-radius:14px">
<tr><td align="center" style="padding:34px 24px 20px;border-bottom:1px solid #4e3b20">
<div style="font-size:34px;color:#dfbd78;line-height:1" aria-hidden="true">&#9819;</div>
<div style="font-size:26px;font-weight:700;letter-spacing:3px;color:#dfbd78;margin-top:12px">HBLE</div>
<div style="font-size:11px;letter-spacing:3px;color:#c6a76b;margin-top:8px">HUMBLE BEGINNINGS. LEGENDARY ENDINGS.</div></td></tr>
<tr><td style="padding:30px 28px 14px">
<h1 style="font-size:24px;line-height:1.3;margin:0 0 20px;color:#f8f3e9">${isMusic ? 'Thank you for supporting HBLE Music!' : 'We received your inquiry.'}</h1>
<p style="font-size:16px;line-height:1.7;color:#e3d9c9;margin:0 0 26px">${message}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#d7b374;border-radius:5px"><a href="${destination}" style="display:inline-block;padding:15px 23px;color:#17120b;text-decoration:none;font-weight:bold;font-size:12px;letter-spacing:1px">${cta}</a></td></tr></table>
<p style="font-size:13px;line-height:1.6;color:#b6aa97;margin:25px 0 0">Thank you for being part of the HBLE journey.</p>
</td></tr>
<tr><td align="center" style="padding:22px 20px 30px;border-top:1px solid #4e3b20">
<p style="margin:0 0 10px;color:#d7b374;font-size:13px;font-weight:bold">THE HBLE TEAM</p>
<a href="https://hble.org" style="color:#d7b374;font-size:13px">hble.org</a>
<p style="color:#958c80;font-size:11px;line-height:1.5;margin:12px 0 0">HBLE Studios · Humble Beginnings. Legendary Endings.</p>
</td></tr></table></td></tr></table></body></html>`;

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
        html,
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
