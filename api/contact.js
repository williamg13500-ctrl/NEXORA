import { db } from 'hatchable';
export const access = 'public';
export const methods = ['POST'];
const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
const brands=new Set(['SKYLINE Architecture & Design','SCHOLARS UNIVERSITY','NEXORA TECHNOLOGIES','TEKDiD Forex Trading Technology','NEXORA GROUP / Not sure yet']);
async function hash(v){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('');}
function ref(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=new Uint8Array(5);crypto.getRandomValues(bytes);let s='NX-';for(let i=0;i<bytes.length;i++)s+=chars[bytes[i]%chars.length];return s;}
export default async function(req,res){
 try{
  const b=req.body&&typeof req.body==='object'?req.body:{};
  if(clean(b.website,200))return res.json({ok:true,message:'Thank you. Your enquiry has been received.'});
  const name=clean(b.name,120),phone=clean(b.phone,30),email=clean(b.email,254).toLowerCase(),brand=clean(b.brand,80),message=clean(b.message,4000),idempotencyKey=/^[0-9a-f-]{36}$/i.test(clean(b.idempotencyKey,64))?clean(b.idempotencyKey,64):'';
  if(name.length<2)return res.status(400).json({error:'Please enter your name.'});
  if(!/^\+[1-9]\d{7,14}$/.test(phone))return res.status(400).json({error:'Enter a valid international phone number including country code.'});
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Enter a valid email address or leave it blank.'});
  if(!brands.has(brand))return res.status(400).json({error:'Please choose a brand or select Not sure yet.'});
  if(message.length<10)return res.status(400).json({error:'Please add a little more detail (at least 10 characters).'});
  if(idempotencyKey){const existing=await db.query('SELECT reference_code FROM enquiries WHERE idempotency_key=$1',[idempotencyKey]);if(existing.rows.length)return res.status(200).json({ok:true,referenceCode:existing.rows[0].reference_code,message:'This enquiry was already saved. Keep your reference code to check its status.',trackUrl:'/track?ref='+encodeURIComponent(existing.rows[0].reference_code),duplicate:true});}
  const forwarded=req.headers['x-forwarded-for']||req.headers['cf-connecting-ip']||req.headers['x-real-ip']||'anonymous';
  const ipHash=await hash(String(forwarded).split(',')[0].trim()||'anonymous');
  const rate=await db.query("SELECT count(*)::int AS total FROM enquiries WHERE created_at > now() - interval '15 minutes' AND ip_hash=$1",[ipHash]);
  if(Number(rate.rows?.[0]?.total||0)>=5){res.setHeader('Retry-After','900');return res.status(429).json({error:'Too many enquiries recently. Please try again in about 15 minutes or contact us on WhatsApp.'});}
  let reference=ref(),inserted;
  for(let attempt=0;attempt<3;attempt++){try{inserted=await db.query('INSERT INTO enquiries(reference_code,name,phone,email,brand,message,ip_hash,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,reference_code,created_at',[reference,name,phone,email||null,brand,message,ipHash,idempotencyKey||null]);break;}catch(e){if(idempotencyKey){const duplicate=await db.query('SELECT id,reference_code,created_at FROM enquiries WHERE idempotency_key=$1',[idempotencyKey]);if(duplicate.rows.length){inserted=duplicate;break;}}if(attempt===2)throw e;reference=ref();}}
  return res.status(201).json({ok:true,referenceCode:inserted.rows[0].reference_code,message:'Enquiry saved. Keep your reference code to check its status.',trackUrl:'/track?ref='+encodeURIComponent(inserted.rows[0].reference_code)});
 }catch(e){console.error('Enquiry save failed:',e?.message||e);return res.status(500).json({error:'We could not save your enquiry right now. Please try again or contact us on WhatsApp.'});}
}