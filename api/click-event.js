import { db } from 'hatchable';
export const access = 'public';
export const methods = ['POST'];
const brands=new Set(['NEXORA GROUP','SKYLINE Architecture & Design','SCHOLARS UNIVERSITY','NEXORA TECHNOLOGIES','TEKDiD Forex Trading Technology']);
const sources=new Set(['explore','platform_link']);
export default async function(req,res){
 try{
  const b=req.body&&typeof req.body==='object'?req.body:{};
  const brand=String(b.brand||'').trim(),source=String(b.source||'').trim();
  if(!brands.has(brand)||!sources.has(source))return res.status(400).json({error:'Valid brand and click source required.'});
  const origin=req.headers?.origin,host=String(req.headers?.['x-forwarded-host']||req.headers?.host||'').split(',')[0].trim();
  if(origin&&host){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Cross-origin analytics request rejected.'})}catch{return res.status(403).json({error:'Invalid request origin.'})}}
  const limited=await db.query("INSERT INTO click_event_limits(bucket_start,event_count) VALUES(date_trunc('minute',now()),1) ON CONFLICT(bucket_start) DO UPDATE SET event_count=click_event_limits.event_count+1 WHERE click_event_limits.event_count<120 RETURNING event_count");
  if(!limited.rows?.length){res.setHeader('Retry-After','60');return res.status(429).json({error:'Click analytics rate limit reached.'})}
  await db.query('INSERT INTO click_events(brand,source) VALUES($1,$2)',[brand,source]);
  res.setHeader('Cache-Control','no-store');
  return res.status(202).json({ok:true,recorded:true});
 }catch(e){console.error('Click analytics failed',e?.message||e);return res.status(500).json({error:'Click analytics temporarily unavailable.'});}
}