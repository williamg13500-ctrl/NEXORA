import { db, email, config } from 'hatchable';

export const access = 'public';
export const methods = ['POST'];

const BRANDS = new Set(['SKYLINE Architecture & Design','SCHOLARS UNIVERSITY','NEXORA TECHNOLOGIES','TEKDiD Forex Trading Technology','NEXORA GROUP / Not sure yet']);
const clean = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const escapeHtml = (v) => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
}

export default async function (req, res) {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    // Quietly accept honeypot submissions without storing or notifying.
    if (clean(body.website, 200)) return res.json({ ok: true, message: 'Thank you. Your message has been received.' });

    const name = clean(body.name, 120);
    const address = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 40);
    const brand = clean(body.brand, 80);
    const message = clean(body.message, 4000);
    if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (phone && !/^[+()\d .-]{7,40}$/.test(phone)) return res.status(400).json({ error: 'Please check the phone number format.' });
    if (!BRANDS.has(brand)) return res.status(400).json({ error: 'Please choose a brand or select “Not sure yet”.' });
    if (message.length < 10) return res.status(400).json({ error: 'Please add a little more detail (at least 10 characters).' });
    if (message.length > 4000) return res.status(400).json({ error: 'Your message is too long.' });

    const forwarded = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || '';
    const ip = String(forwarded).split(',')[0].trim() || ('ua:' + clean(req.headers['user-agent'], 240));
    const ipHash = await hash(ip || 'anonymous');
    const rate = await db.query(
      "SELECT count(*)::int AS total FROM contact_submissions WHERE created_at > now() - interval '15 minutes' AND (ip_hash = $1 OR email = $2)",
      [ipHash, address]
    );
    if (Number(rate.rows?.[0]?.total || 0) >= 5) {
      res.setHeader('Retry-After', '900');
      return res.status(429).json({ error: 'Too many messages have been sent recently. Please try again in about 15 minutes or contact us by WhatsApp.' });
    }

    const inserted = await db.query(
      'INSERT INTO contact_submissions (name,email,phone,brand,message,ip_hash,notification_status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at',
      [name, address, phone, brand, message, ipHash, 'pending']
    );

    const recipient = await config.get('lead_recipient_email');
    let notification = 'not_configured';
    if (typeof recipient === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim())) {
      try {
        await email.send({
          to: recipient.trim(),
          subject: 'NEXORA GROUP website enquiry — ' + brand,
          text: 'New NEXORA GROUP website enquiry\n\nName: ' + name + '\nEmail: ' + address + '\nPhone: ' + (phone || 'Not provided') + '\nBrand: ' + brand + '\n\nMessage:\n' + message + '\n\nSubmission ID: ' + inserted.rows[0].id,
          html: '<h2>New NEXORA GROUP enquiry</h2><p><b>Name:</b> ' + escapeHtml(name) + '</p><p><b>Email:</b> ' + escapeHtml(address) + '</p><p><b>Phone:</b> ' + escapeHtml(phone || 'Not provided') + '</p><p><b>Brand:</b> ' + escapeHtml(brand) + '</p><p><b>Message:</b><br>' + escapeHtml(message).replace(/\n/g,'<br>') + '</p><p>Submission ID: ' + inserted.rows[0].id + '</p>'
        });
        notification = 'sent';
      } catch (e) {
        console.error('Contact notification email failed:', e?.message || e);
        notification = 'failed';
      }
    }
    await db.query('UPDATE contact_submissions SET notification_status = $1 WHERE id = $2', [notification, inserted.rows[0].id]);
    return res.status(201).json({
      ok: true,
      notification,
      message: notification === 'sent'
        ? 'Thanks — your message has been sent. We’ll be in touch.'
        : 'Thanks — your message has been saved. Email notifications are not fully configured yet; you can also reach us on WhatsApp or phone.'
    });
  } catch (e) {
    console.error('Contact submission error:', e?.message || e);
    return res.status(500).json({ error: 'We could not submit your message right now. Please try again or contact us on WhatsApp.' });
  }
}