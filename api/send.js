// Vercel serverless function — emails the leader's 3-9-17 decision brief
// to the leader, and BCCs the Sellership admin on every send.
//
// Required env vars (set in Vercel project settings):
//   RESEND_API_KEY   — from resend.com
//   FROM_EMAIL        — verified sender, e.g. "The 3-9-17 Formula <formula@sellershipuniversity.com>"
//   ADMIN_EMAIL       — BCC recipient, defaults to benward4@gmail.com

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATH_LABELS = { leadFirst: 'Lead First', develop: 'Develop', reposition: 'Reposition', exit: 'Exit' };

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();
  const path = String(body.path || '');
  const summary = String(body.summary || '');

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }
  if (!summary) {
    res.status(400).json({ error: 'Missing summary' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'The 3-9-17 Formula <onboarding@resend.dev>';
  const adminEmail = process.env.ADMIN_EMAIL || 'benward4@gmail.com';

  if (!apiKey) {
    res.status(500).json({ error: 'Email is not configured yet' });
    return;
  }

  const greeting = name ? escapeHtml(name) : 'there';
  const pathLabel = PATH_LABELS[path] || path;

  const html =
    '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#23364A;">' +
      '<div style="background:#072543;padding:28px 30px;border-radius:12px 12px 0 0;">' +
        '<div style="color:#1DC0DC;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;">The Sellership System&reg;</div>' +
        '<div style="color:#fff;font-size:24px;font-weight:800;">The 3-9-17 Formula</div>' +
        '<div style="color:#B1B8BD;font-size:13px;margin-top:6px;">Your path: ' + escapeHtml(pathLabel) + '</div>' +
      '</div>' +
      '<div style="background:#F4F8FB;padding:26px 30px;border-radius:0 0 12px 12px;">' +
        '<p style="font-size:14px;line-height:1.6;">Hi ' + greeting + ',</p>' +
        '<p style="font-size:14px;line-height:1.6;">Here is the decision brief from your 3-9-17 session.</p>' +
        '<pre style="white-space:pre-wrap;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.7;background:#fff;border:1px solid #e4e9ee;border-radius:10px;padding:18px 20px;">' + escapeHtml(summary) + '</pre>' +
        '<p style="font-size:12px;color:#7A8DA0;margin-top:20px;">Make it a great day. &mdash; BenWard.com &middot; Sellership</p>' +
      '</div>' +
    '</div>';

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        bcc: [adminEmail],
        subject: 'Your 3-9-17 decision brief — ' + pathLabel,
        html: html,
        text: summary
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Resend error', resp.status, errText);
      res.status(502).json({ error: 'Email provider error' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failed', err);
    res.status(500).json({ error: 'Send failed' });
  }
};
