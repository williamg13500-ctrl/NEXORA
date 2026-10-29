import { db } from 'hatchable';
export const access = 'admin';
export const methods = ['GET', 'PUT'];

const validDate = value => {
  const s = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  const d = new Date(s + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : '';
};
function filters(req) {
  return {
    q: String(req.query?.q || '').trim().slice(0, 100),
    brand: String(req.query?.brand || '').slice(0, 80),
    status: String(req.query?.status || '').slice(0, 20),
    dateFrom: validDate(req.query?.dateFrom ?? req.query?.date),
    dateTo: validDate(req.query?.dateTo),
  };
}
const where = "WHERE ($1='' OR brand=$1) AND ($2='' OR status=$2) AND ($3='' OR name ILIKE '%'||$3||'%' OR phone ILIKE '%'||$3||'%' OR reference_code ILIKE '%'||$3||'%' OR email ILIKE '%'||$3||'%') AND ($4::date IS NULL OR created_at >= $4::date) AND ($5::date IS NULL OR created_at < ($5::date + interval '1 day'))";
export default async function(req, res) {
 try {
  if (req.method === 'GET') {
   const f = filters(req);
   const rawPage = Number.parseInt(String(req.query?.page || '1'), 10);
   const rawSize = Number.parseInt(String(req.query?.pageSize || '25'), 10);
   const pageSize = Number.isFinite(rawSize) ? Math.min(100, Math.max(1, rawSize)) : 25;
   const page = Number.isFinite(rawPage) ? Math.max(1, Math.min(1000000, rawPage)) : 1;
   const params = [f.brand, f.status, f.q, f.dateFrom || null, f.dateTo || null];
   const countResult = await db.query('SELECT count(*)::int AS total FROM enquiries ' + where, params);
   const total = Number(countResult.rows?.[0]?.total || 0);
   const totalPages = Math.max(1, Math.ceil(total / pageSize));
   const currentPage = Math.min(page, totalPages);
   const offset = (currentPage - 1) * pageSize;
   const r = await db.query('SELECT id,reference_code,name,phone,email,brand,message,status,public_note,private_notes,created_at,updated_at FROM enquiries ' + where + ' ORDER BY created_at DESC, id DESC LIMIT $6 OFFSET $7', [...params, pageSize, offset]);
   res.setHeader('Cache-Control', 'no-store');
   return res.json({ enquiries: r.rows, pagination: { page: currentPage, pageSize, total, totalPages, hasPrevious: currentPage > 1, hasNext: currentPage < totalPages }, filters: f, exportScope: 'current_page' });
  }
  const origin = req.headers?.origin;
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim();
  if (origin && host) {
   try { if (new URL(origin).host !== host) return res.status(403).json({ error: 'Cross-origin admin update rejected.' }); }
   catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
  }
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const id = Number(b.id), status = String(b.status || '');
  const publicNote = String(b.public_note || '').slice(0, 2000), privateNotes = String(b.private_notes || '').slice(0, 5000);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Valid enquiry id required.' });
  if (!['new','contacted','in_progress','closed'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const before = await db.query('SELECT status,public_note,private_notes FROM enquiries WHERE id=$1', [id]);
  if (!before.rows.length) return res.status(404).json({ error: 'Enquiry not found.' });
  const prior = before.rows[0], changes = [];
  if (prior.status !== status) changes.push('status');
  if ((prior.public_note || '') !== publicNote) changes.push('public_note');
  if ((prior.private_notes || '') !== privateNotes) changes.push('private_notes');
  const actor = String(req.member?.id || req.user?.id || 'admin').slice(0,160);
  const tx = await db.transaction([
   { sql: 'UPDATE enquiries SET status=$1,public_note=$2,private_notes=$3,updated_at=now() WHERE id=$4 RETURNING id,reference_code,status,public_note,private_notes,updated_at', params: [status,publicNote,privateNotes,id] },
   { sql: 'INSERT INTO enquiry_audit(enquiry_id,actor_id,old_status,new_status,change_summary) VALUES($1,$2,$3,$4,$5)', params: [id,actor,prior.status,status,changes.join(',') || 'no_field_change'] }
  ]);
  const updated = tx.results?.[0]?.rows?.[0];
  if (!updated) return res.status(404).json({ error: 'Enquiry not found.' });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ ok: true, enquiry: updated });
 } catch (e) {
  console.error('Admin inbox error', e?.message || e);
  return res.status(500).json({ error: 'Could not process inbox request.' });
 }
}