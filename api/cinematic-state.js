import { db, admin } from 'hatchable';
export const access='public';
export const methods=['GET','PUT'];
export default async function(req,res){
 try {
  if(req.method==='PUT'){
   const allowed=await admin.require(req,res);
   if(!allowed)return;
   const b=req.body&&typeof req.body==='object'?req.body:{};
   const key=String(b.key||'');
   if(!['scene_enabled','reduced_effects','quality'].includes(key))return res.status(400).json({error:'Invalid setting key.'});
   let value=b.value;
   if(key==='scene_enabled'){
    if(!value||typeof value!=='object'||Array.isArray(value))return res.status(400).json({error:'Scene map required.'});
    const clean={};for(const k of ['hero','skyline','scholars','technologies','tekdid'])clean[k]=value[k]===true;value=clean;
   }else if(key==='reduced_effects'){
    if(typeof value!=='boolean')return res.status(400).json({error:'Boolean required.'});
   }else if(!['high','balanced','low'].includes(value))return res.status(400).json({error:'Quality must be high, balanced or low.'});
   await db.query('INSERT INTO cinematic_settings(setting_key,setting_value,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=now()',[key,JSON.stringify(value)]);
   return res.json({ok:true,key,value});
  }
  const [p,s]=await Promise.all([db.query('SELECT id,status,is_gated FROM platforms'),db.query('SELECT setting_key,setting_value FROM cinematic_settings')]);
  const platforms={};
  for(const row of p.rows){
   let pulse='coming_soon';
   if(row.is_gated||row.status==='coming_soon')pulse='coming_soon';
   else if(row.status==='maintenance')pulse='slow';
   else if(row.status==='live')pulse='online';
   platforms[row.id]={status:row.status,pulse,gated:row.is_gated};
  }
  const settings={};for(const row of s.rows)settings[row.setting_key]=row.setting_value;
  return res.json({platforms,settings,pulseSource:'platform_registry',updatedAt:new Date().toISOString()});
 }catch(e){console.error('Cinematic state error',e?.message||e);return res.status(500).json({error:'Cinematic state unavailable.'});}
}