(()=>{'use strict';
const videos=[...document.querySelectorAll('video[data-cinematic-video]')];if(!videos.length)return;
const motion=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const staticMode=()=>motion.matches||connection?.saveData===true||/^(slow-2g|2g)$/.test(connection?.effectiveType||'');
let active=null,observer;
function loadSources(video){video.querySelectorAll('source[data-src]').forEach(s=>{if(!s.src)s.src=s.dataset.src});if(video.dataset.src&&!video.src)video.src=video.dataset.src;video.preload='metadata';video.load()}
function pause(video){video.pause();video.classList.remove('is-playing');if(video.dataset.resetOnPause==='true'){try{video.currentTime=0}catch{}}}
function stopAll(){videos.forEach(pause);active=null}
function onVisible(video,visible){if(!visible){pause(video);if(active===video)active=null;return}if(staticMode()){pause(video);return}if(video.dataset.autoplay!=='true')return;if(active&&active!==video)pause(active);loadSources(video);active=video;const p=video.play();if(p&&p.catch)p.catch(()=>{pause(video);if(active===video)active=null})}
videos.forEach(video=>{video.addEventListener('playing',()=>video.classList.add('is-playing'));video.addEventListener('pause',()=>video.classList.remove('is-playing'));video.preload='none';video.setAttribute('playsinline','');video.muted=true;video.loop=true;if(!video.poster)video.dataset.posterMissing='true';if('IntersectionObserver'in window){observer=observer||new IntersectionObserver(entries=>entries.forEach(e=>onVisible(e.target,e.isIntersecting)),{rootMargin:'120px 0px',threshold:.12});observer.observe(video)}else onVisible(video,true)});
function refresh(){if(staticMode()){stopAll();videos.forEach(v=>{v.preload='none';v.removeAttribute('src');v.querySelectorAll('source').forEach(s=>s.removeAttribute('src'))});return}videos.forEach(v=>{const r=v.getBoundingClientRect(),visible=r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;if(visible)onVisible(v,true)})}
motion.addEventListener?.('change',refresh);connection?.addEventListener?.('change',refresh);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});
})();