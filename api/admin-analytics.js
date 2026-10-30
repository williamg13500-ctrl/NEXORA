import { db } from 'hatchable';
export const access = 'admin';
export const methods = ['GET'];
const brands=['NEXORA GROUP','SKYLINE Architecture & Design','SCHOLARS UNIVERSITY','NEXORA TECHNOLOGIES','TEKDiD Forex Trading Technology'];
export default async function(req,res){
 try{
  const clicks=await db.query("SELECT brand,count(*)::int AS clicks FROM click_events WHERE created_at>=now()-interval '30 days' GROUP BY brand");
  const enquiries=await db.query("SELECT brand,count(*)::int AS enquiries FROM enquiries WHERE created_at>=now()-interval '30 days' GROUP BY brand");
  const cm=new Map(clicks.rows.map(r=>[r.brand,Number(r.clicks||0)])),em=new Map(enquiries.rows.map(r=>[r.brand,Number(r.enquiries||0)]));
  const rows=brands.map(brand=>({brand,clicks:cm.get(brand)||0,enquiries:em.get(brand)||0}));
  res.setHeader('Cache-Control','no-store');
  return res.json({windowDays:30,from:new Date(Date.now()-30*86400000).toISOString(),to:new Date().toISOString(),brands:rows,totals:{clicks:rows.reduce((n,r)=>n+r.clicks,0),enquiries:rows.reduce((n,r)=>n+r.enquiries,0)}});
 }catch(e){console.error('Admin analytics read failed',e?.message||e);return res.status(500).json({error:'Analytics are temporarily unavailable.'});}
}