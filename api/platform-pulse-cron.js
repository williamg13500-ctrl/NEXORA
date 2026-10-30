import { db } from 'hatchable';
import { claimCheck, checkOne } from '../lib/platform-check.js';
export const access = 'scheduler';
export const methods = ['POST'];
export const schedule = '0 * * * *';
export default async function(req,res) {
 try {
   const targets = await db.query("SELECT p.id,p.domain,pc.checked_at FROM platforms p LEFT JOIN LATERAL (SELECT checked_at FROM platform_checks WHERE platform_id=p.id ORDER BY checked_at DESC,id DESC LIMIT 1) pc ON true WHERE p.status='live' AND p.is_gated=false AND p.domain<>'' ORDER BY p.id");
   const results = [];
   for (const platform of targets.rows) {
     if (platform.checked_at && Date.now()-new Date(platform.checked_at).getTime() < 5*60*1000) { results.push({platformId:platform.id,skipped:true,reason:'A check was recorded within the last 5 minutes.'}); continue; }
     let claimed = false;
     try { claimed = await claimCheck(platform.id); } catch (e) { console.error('Could not claim platform check',platform.id,e?.message||e); results.push({platformId:platform.id,skipped:true,reason:'Could not claim check safely.'}); continue; }
     if (!claimed) { results.push({platformId:platform.id,skipped:true,reason:'A check attempt was claimed within the last 5 minutes.'}); continue; }
     try { results.push(await checkOne(platform, { timeoutMs: 8000 })); }
     catch (e) { results.push({ platformId: platform.id, status: 'unknown', error: 'Check result could not be stored.' }); console.error('Platform check failed for', platform.id, e?.message || e); }
   }
   const pruned = await db.query("DELETE FROM platform_checks WHERE checked_at < now() - interval '30 days'");
   return res.json({ ok:true, checked:results.filter(r=>!r.skipped).length, skipped:results.filter(r=>r.skipped).length, results, pruned:Number(pruned?.rowCount ?? pruned?.changes ?? 0), interval:'hourly' });
 } catch(e) {
   console.error('Platform pulse cron failed', e?.message || e);
   return res.status(500).json({ error:'Platform pulse check failed.' });
 }
}