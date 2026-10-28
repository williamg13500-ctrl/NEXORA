import { admin } from 'hatchable';
export const access = 'public';
export default async function (req, res) {
  const allowed = await admin.require(req, res);
  if (!allowed) return;
  return res.redirect('/admin.html');
}