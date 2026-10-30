import { db } from 'hatchable';
export const access = 'public';
export const methods = ['GET'];
export default async function(req,res){
 try {
  const r=await db.query('SELECT id,title,body,brand,is_pinned,published_at FROM announcements WHERE published_at<=now() ORDER BY is_pinned DESC,published_at DESC,id DESC LIMIT 5');
  res.setHeader('Cache-Control','public, max-age=60, stale-while-revalidate=120');
  return res.json({announcements:r.rows});
 } catch(e){console.error('Announcements public read failed',e?.message||e);return res.status(500).json({error:'Announcements are temporarily unavailable.'});}
}