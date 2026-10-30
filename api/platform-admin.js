import { db } from 'hatchable';
export const access = 'admin';
export const methods = ['GET','PUT','POST'];

function safeTarget(value) {
  if (!String(value || '').trim()) return '';
  let u;
  try { u = new URL(String(value).trim()); } catch { return null; }
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
  if (!host.includes('.') || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) return null;
  return u.toString().replace(/\/$/, '');
}
async function checkOne(platform) {
  let target = safeTarget(platform.domain);
  if (!target) {
    const error = 'Check skipped: platform domain must be a public HTTPS hostname.';
    await db.query("INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,'unknown',NULL,NULL,$2,$2,now())", [platform.id,error]);
    return { platformId:platform.id,status:'unknown',responseMs:null,httpStatus:null,error,checkedAt:new Date().toISOString() };
  }
  const started = Date.now();
  let status='unknown', httpStatus=null, error=null, detail='';
  try {
    const response = await fetch(target, { method:'GET', redirect:'manual', cache:'no-store', headers:{'user-agent':'NEXORA-Platform-Pulse/1.0','accept':'text/html,application/xhtml+xml,*/*;q=0.8'}, signal:AbortSignal.timeout(8000) });
    const responseMs=Date.now()-started;
    httpStatus=response.status;
    if(httpStatus>=200&&httpStatus<=399){status=responseMs>3000?'slow':'online';detail=httpStatus>=300?'HTTP redirect response':'HTTP success response'}
    else if(httpStatus>=500){status='offline';error='HTTP '+httpStatus+' server error';detail=error}
    else{status='unknown';error='Unexpected HTTP '+httpStatus+'; not treated as online.';detail=error}
    try{await response.body?.cancel()}catch{}
    const inserted=await db.query('INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,$2,$3,$4,$5,$6,now()) RETURNING checked_at',[platform.id,status,responseMs,httpStatus,error,detail]);
    return {platformId:platform.id,status,responseMs,httpStatus,error,checkedAt:inserted.rows?.[0]?.checked_at||new Date().toISOString()};
  } catch(e) {
    const responseMs=Date.now()-started;
    error=String(e?.name==='TimeoutError'||e?.name==='AbortError'?'Request timed out after 8 seconds.':(e?.message||'Network or DNS request failed.')).slice(0,500);
    status='offline';detail=error;
    const inserted=await db.query('INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,$2,$3,NULL,$4,$5,now()) RETURNING checked_at',[platform.id,status,responseMs,error,detail]);
    return {platformId:platform.id,status,responseMs,httpStatus:null,error,checkedAt:inserted.rows?.[0]?.checked_at||new Date().toISOString()};
  }
}
function validDomain(value){return safeTarget(value)!==null}
export default async function(req,res) {
 try {
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET') {
    const p=await db.query('SELECT id,name,domain,status,tagline,override_message,is_gated,updated_at FROM platforms ORDER BY name');
    const c=await db.query('SELECT id,platform_id,status,response_ms,http_status,error,detail,checked_at FROM (SELECT pc.*,row_number() OVER(PARTITION BY platform_id ORDER BY checked_at DESC,id DESC) AS rn FROM platform_checks pc) ranked WHERE rn<=20 ORDER BY platform_id,checked_at DESC,id DESC');
    const checks={};for(const row of c.rows){(checks[row.platform_id] ||= []).push(row)}
    const a=await db.query('SELECT id,platform_id,actor_id,change_summary,old_values,new_values,created_at FROM platform_audit ORDER BY created_at DESC,id DESC LIMIT 50');
    return res.json({platforms:p.rows,checks,audit:a.rows});
  }
  const origin=req.headers?.origin;
  const host=String(req.headers?.['x-forwarded-host']||req.headers?.host||'').split(',')[0].trim();
  if(origin&&host){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Cross-origin platform update rejected.'})}catch{return res.status(403).json({error:'Invalid request origin.'})}}
  const b=req.body&&typeof req.body==='object'?req.body:{};
  const platformId=String(b.platformId||b.id||'').slice(0,80);
  const priorResult=await db.query('SELECT id,name,domain,status,tagline,override_message,is_gated,updated_at FROM platforms WHERE id=$1',[platformId]);
  if(!priorResult.rows.length)return res.status(404).json({error:'Platform not found.'});
  const prior=priorResult.rows[0];
  if(req.method==='POST') {
    if(String(b.action||'')!=='check')return res.status(400).json({error:'Unsupported action.'});
    if(prior.status!=='live'||prior.is_gated||!prior.domain)return res.status(409).json({error:'Checks are only allowed for platforms marked live, ungated, with a domain.'});
    const result=await checkOne(prior);
    return res.json({ok:true,result});
  }
  const name=String(b.name??prior.name).trim().slice(0,160);
  const status=String(b.status??prior.status);
  const tagline=String(b.tagline??prior.tagline).trim().slice(0,500);
  const domainRaw=String(b.domain??prior.domain).trim();
  const domain=safeTarget(domainRaw);
  const overrideMessage=String(b.override_message??prior.override_message).trim().slice(0,1000);
  const isGated=typeof b.is_gated==='boolean'?b.is_gated:prior.is_gated;
  if(!name)return res.status(400).json({error:'Platform name is required.'});
  if(!['live','coming_soon','maintenance'].includes(status))return res.status(400).json({error:'Invalid platform status.'});
  if(domain===null)return res.status(400).json({error:'Domain must be a public HTTPS hostname. Private IPs, local hostnames, custom ports and credentials are not allowed.'});
  if(status==='live'&&!domain)return res.status(400).json({error:'A live platform must have a domain.'});
  const next={name,domain,status,tagline,override_message:overrideMessage,is_gated:isGated};
  const old={name:prior.name,domain:prior.domain,status:prior.status,tagline:prior.tagline,override_message:prior.override_message,is_gated:prior.is_gated};
  const changed=Object.keys(next).filter(k=>next[k]!==old[k]);
  if(!changed.length)return res.json({ok:true,platform:prior,changed:[]});
  const actor=String(req.member?.id||req.user?.id||'admin').slice(0,160);
  const tx=await db.transaction([
   {sql:'UPDATE platforms SET name=$1,domain=$2,status=$3,tagline=$4,override_message=$5,is_gated=$6,updated_at=now() WHERE id=$7 RETURNING id,name,domain,status,tagline,override_message,is_gated,updated_at',params:[name,domain,status,tagline,overrideMessage,isGated,platformId]},
   {sql:'INSERT INTO platform_audit(platform_id,actor_id,change_summary,old_values,new_values) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)',params:[platformId,actor,changed.join(', '),JSON.stringify(Object.fromEntries(changed.map(k=>[k,old[k]]))),JSON.stringify(Object.fromEntries(changed.map(k=>[k,next[k]])))]}
  ]);
  const updated=tx.results?.[0]?.rows?.[0];
  return res.json({ok:true,platform:updated,changed});
 }catch(e){console.error('Platform admin error',e?.message||e);return res.status(500).json({error:'Could not process platform request.'})}
}