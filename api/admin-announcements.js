import { db } from 'hatchable';
export const access = 'admin';
export const methods = ['GET','POST','PUT','DELETE'];
const clean=(v,n)=>typeof v==='string'?v.replace(/<[^>]*>/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,n):'';
const brands=new Set(['NEXORA GROUP','SKYLINE Architecture & Design','SCHOLARS UNIVERSITY','NEXORA TECHNOLOGIES','TEKDiD Forex Trading Technology']);
function validId(v){const n=Number(v);return Number.isSafeInteger(n)&&n>0?n:null}
export default async function(req,res){
 try{
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){
   const r=await db.query('SELECT id,title,body,brand,is_pinned,published_at,created_at FROM announcements ORDER BY is_pinned DESC,published_at DESC,id DESC LIMIT 100');
   return res.json({announcements:r.rows});
  }
  const origin=req.headers?.origin,host=String(req.headers?.['x-forwarded-host']||req.headers?.host||'').split(',')[0].trim();
  if(origin&&host){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Cross-origin admin update rejected.'})}catch{return res.status(403).json({error:'Invalid request origin.'})}}
  const b=req.body&&typeof req.body==='object'?req.body:{};
  if(req.method==='DELETE'){
   const id=validId(b.id??req.query?.id);if(!id)return res.status(400).json({error:'Valid announcement id required.'});
   const d=await db.query('DELETE FROM announcements WHERE id=$1 RETURNING id',[id]);
   if(!d.rows.length)return res.status(404).json({error:'Announcement not found.'});
   return res.json({ok:true,deletedId:id});
  }
  const title=clean(b.title,120),body=clean(b.body,1200),brand=clean(b.brand,80),isPinned=b.is_pinned===true||b.is_pinned==='true';
  if(title.length<3)return res.status(400).json({error:'Title must be 3–120 characters.'});
  if(body.length<5)return res.status(400).json({error:'Announcement text must be 5–1200 characters.'});
  if(!brands.has(brand))return res.status(400).json({error:'Choose a valid brand tag.'});
  if(req.method==='POST'){
   const r=await db.query('INSERT INTO announcements(title,body,brand,is_pinned,published_at) VALUES($1,$2,$3,$4,now()) RETURNING id,title,body,brand,is_pinned,published_at,created_at',[title,body,brand,isPinned]);
   return res.status(201).json({ok:true,announcement:r.rows[0]});
  }
  const id=validId(b.id);if(!id)return res.status(400).json({error:'Valid announcement id required.'});
  const r=await db.query('UPDATE announcements SET title=$1,body=$2,brand=$3,is_pinned=$4 WHERE id=$5 RETURNING id,title,body,brand,is_pinned,published_at,created_at',[title,body,brand,isPinned,id]);
  if(!r.rows.length)return res.status(404).json({error:'Announcement not found.'});
  return res.json({ok:true,announcement:r.rows[0]});
 }catch(e){console.error('Admin announcements error',e?.message||e);return res.status(500).json({error:'Could not process announcement request.'});}
}