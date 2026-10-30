import { db, admin } from 'hatchable';
import { claimCheck, checkOne } from '../lib/platform-check.js';
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
  res.setHeader('Cache-Control','no-store');
  const [p,s]=await Promise.all([
   db.query("SELECT p.id,p.status,p.domain,p.is_gated,p.override_message,pc.status AS check_status,pc.response_ms,pc.http_status,pc.error,pc.checked_at FROM platforms p LEFT JOIN LATERAL (SELECT status,response_ms,http_status,error,checked_at FROM platform_checks WHERE platform_id=p.id ORDER BY checked_at DESC,id DESC LIMIT 1) pc ON true ORDER BY p.id"),
   db.query('SELECT setting_key,setting_value FROM cinematic_settings')
  ]);
  // Refresh only live, ungated platforms with an empty or older-than-five-minute real check.
  // Claiming is atomic and shared with cron, so overlapping requests cannot fan out checks.
  for(const row of p.rows){
   if(row.status!=='live'||row.is_gated===true||!String(row.domain||'').trim())continue;
   const ageMs=row.checked_at?Date.now()-new Date(row.checked_at).getTime():null;
   if(ageMs!==null&&Number.isFinite(ageMs)&&ageMs<5*60*1000)continue;
   try{
    if(await claimCheck(row.id)){
     try{await checkOne({id:row.id,domain:row.domain},{timeoutMs:4000});}
     catch(e){console.error('On-demand platform refresh failed for',row.id,e?.message||e);}
     // Refresh the result row when possible; a failed request/storage operation must not fail the endpoint.
     try{
      const latest=await db.query('SELECT status,response_ms,http_status,error,checked_at FROM platform_checks WHERE platform_id=$1 ORDER BY checked_at DESC,id DESC LIMIT 1',[row.id]);
      if(latest.rows[0])Object.assign(row,{check_status:latest.rows[0].status,response_ms:latest.rows[0].response_ms,http_status:latest.rows[0].http_status,error:latest.rows[0].error,checked_at:latest.rows[0].checked_at});
     }catch(e){console.error('Could not refresh latest platform check row',row.id,e?.message||e);}
    }
   }catch(e){console.error('On-demand platform refresh claim failed for',row.id,e?.message||e);}
  }
  const platforms={};
  for(const row of p.rows){
   const checkedMs=row.checked_at?new Date(row.checked_at).getTime():null;
   const ageMs=checkedMs!==null&&Number.isFinite(checkedMs)?Math.max(0,Date.now()-checkedMs):null;
   const fresh=ageMs!==null&&ageMs<=15*60*1000;
   let pulse='unknown';
   if(row.is_gated)pulse='gated';
   else if(row.status==='coming_soon')pulse='coming_soon';
   else if(row.status==='maintenance')pulse='slow';
   else if(row.status==='live'&&fresh&&['online','slow','offline'].includes(row.check_status))pulse=row.check_status;
   platforms[row.id]={status:row.status,domain:row.domain||'',pulse,gated:row.is_gated===true,lastCheckedAt:row.checked_at||null,checkAgeMinutes:ageMs===null?null:Math.floor(ageMs/60000),responseMs:row.response_ms===null?null:Number(row.response_ms),httpStatus:row.http_status===null?null:Number(row.http_status),checkError:row.error||null,overrideMessage:row.override_message||'',checkStatus:row.check_status||null,checkIsFresh:fresh};
  }
  const settings={};for(const row of s.rows)settings[row.setting_key]=row.setting_value;
  return res.json({platforms,settings,pulseSource:'platform_checks',freshnessMinutes:15,refreshThrottleMinutes:5,updatedAt:new Date().toISOString()});
 }catch(e){console.error('Cinematic state error',e?.message||e);return res.status(500).json({error:'Cinematic state unavailable.'});}
}