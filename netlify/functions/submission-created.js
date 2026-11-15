// Netlify Forms event function. Configure RESEND_API_KEY and a verified sender domain in Netlify.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  let submission;
  try { submission = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }
  const data = submission.payload?.data || submission.data || {};
  const formName = submission.payload?.form_name || submission.form_name || data['form-name'];
  if (formName !== 'hble-music-downloads') return { statusCode: 200, body: 'Ignored' };
  const email = String(data.email || '').trim();
  const song = String(data.song || '').trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !song) return { statusCode: 400, body: 'Missing download details' };
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.HBLE_EMAIL_FROM;
  if (!apiKey || !sender) return { statusCode: 503, body: 'Email service not configured' };
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: sender,
      to: [email],
      subject: 'Thank you for supporting HBLE Music!',
      html: '<div style="font-family:Arial,sans-serif;background:#14110c;color:#f7ecd9;padding:30px"><h1 style="color:#d8b170">Thank You for Supporting HBLE!</h1><p>We appreciate you downloading <strong>' + escapeHtml(song) + '</strong> and being part of our journey.</p><p>Your support helps us continue celebrating music, creativity, and independent talent.</p><p>Discover more at <a style="color:#d8b170" href="https://www.hble.org">hble.org</a>.</p><p>Humble Beginnings. Legendary Endings.<br>— The HBLE Team</p></div>',
      text: 'Thank you for supporting HBLE Music! We appreciate you downloading ' + song + '. Your support helps us celebrate music, creativity, and independent talent. Explore more at https://www.hble.org — The HBLE Team'
    })
  });
  if (!response.ok) return { statusCode: 502, body: 'Email delivery request failed' };
  return { statusCode: 200, body: 'Thank-you email requested' };
};
