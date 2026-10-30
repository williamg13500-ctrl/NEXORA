import { db } from 'hatchable';
export const access = 'scheduler';
export const methods = ['POST'];
export const schedule = '0 3 * * *';
export default async function(req,res){
 try{
  const events=await db.query("DELETE FROM click_events WHERE created_at < now()-interval '90 days'");
  const limits=await db.query("DELETE FROM click_event_limits WHERE bucket_start < now()-interval '2 days'");
  return res.json({ok:true,clickEventsPruned:Number(events?.rowCount??events?.changes??0),rateLimitBucketsPruned:Number(limits?.rowCount??limits?.changes??0),retentionDays:90});
 }catch(e){console.error('Analytics retention job failed',e?.message||e);return res.status(500).json({error:'Analytics retention job failed.'});}
}