(()=>{'use strict';
const labels={online:'Online',slow:'Slow',offline:'Offline',unknown:'Unknown',coming_soon:'Coming soon',gated:'Gated'};
const stateUrl='/api/cinematic-state';
let lastFetch=0,inFlight=false,timer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ageLabel(value){if(!value)return 'Never checked';const t=new Date(value).getTime();if(!Number.isFinite(t))return 'Check time unavailable';const mins=Math.max(0,Math.floor((Date.now()-t)/60000));if(mins<1)return 'Checked less than 1 min ago';return 'Checked '+mins+' min ago'}
function renderChip(el,data){
 const pulse=data?.pulse||'unknown';el.textContent=labels[pulse]||'Unknown';el.className=(el.classList.contains('platform-status')?'platform-status':'brand-number status-label')+' pulse-'+pulse;
 el.setAttribute('aria-label','Platform status: '+(labels[pulse]||'Unknown'));
 if(!el.parentElement?.classList.contains('status-wrap')){const wrap=document.createElement('span');wrap.className='status-wrap';el.parentElement.insertBefore(wrap,el);wrap.appendChild(el)}
 const wrap=el.parentElement,parent=el.closest('[data-platform-id]')||wrap;
 let meta=wrap.querySelector('.status-checked');
 if(!meta&&parent){meta=document.createElement('small');meta.className='status-checked';meta.setAttribute('aria-live','polite');el.insertAdjacentElement('afterend',meta)}
 if(meta){meta.textContent=(pulse==='gated'?'Not checked · gated':pulse==='coming_soon'?'Not monitored · coming soon':data?.lastCheckedAt?ageLabel(data.lastCheckedAt):'Never checked');}
 let msg=wrap.querySelector('.status-override-message');
 if(data?.overrideMessage){if(!msg){msg=document.createElement('small');msg.className='status-override-message';(meta||el).insertAdjacentElement('afterend',msg)}if(msg)msg.textContent=data.overrideMessage}
 else if(msg)msg.remove();
 const card=el.closest('.platform-card');if(card){const open=card.querySelector('.open-platform'),contact=card.querySelector('.contact-platform'),available=data.status==='live'&&!data.gated&&Boolean(data.domain);if(open){open.hidden=!available;if(available)open.href=data.domain+'?utm_source=nexora-group&utm_medium=hub'}if(contact)contact.hidden=available;}
}
function apply(payload){const platforms=payload?.platforms||{};document.querySelectorAll('[data-platform-id]').forEach(card=>{const id=card.getAttribute('data-platform-id'),data=platforms[id];if(!data)return;card.querySelectorAll('.status-label,.platform-status').forEach(el=>renderChip(el,data));});}
async function refresh(){if(document.visibilityState!=='visible'||inFlight)return;inFlight=true;try{const response=await fetch(stateUrl+'?pulse='+Date.now(),{headers:{accept:'application/json'},cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Status unavailable');const data=await response.json();apply(data);lastFetch=Date.now()}catch{document.querySelectorAll('[data-platform-id] .status-label,[data-platform-id] .platform-status').forEach(el=>{el.textContent='Status unavailable';el.className=(el.classList.contains('platform-status')?'platform-status':'brand-number status-label')+' pulse-unknown';el.setAttribute('aria-label','Status unavailable');const wrap=el.parentElement?.classList.contains('status-wrap')?el.parentElement:null;if(wrap){let meta=wrap.querySelector('.status-checked');if(!meta){meta=document.createElement('small');meta.className='status-checked';wrap.appendChild(meta)}meta.textContent='Status endpoint unavailable';wrap.querySelector('.status-override-message')?.remove()}})}finally{inFlight=false}}
function schedule(){clearInterval(timer);timer=setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-lastFetch>=60000)refresh()},60000)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-lastFetch>=60000)refresh()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{refresh();schedule()},{once:true});else{refresh();schedule()}
})();