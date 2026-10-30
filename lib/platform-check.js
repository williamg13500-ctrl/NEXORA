import { db } from 'hatchable';

// Keep the platform pulse SSRF policy centralized and identical for cron and on-demand refresh.
export function safeTarget(value) {
  let u;
  try { u = new URL(String(value || '')); } catch { return null; }
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
  if (!host.includes('.') || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':') || host === '0.0.0.0') return null;
  return u;
}

export async function claimCheck(platformId) {
  const claimed = await db.query("UPDATE platforms SET last_check_attempt_at=now() WHERE id=$1 AND (last_check_attempt_at IS NULL OR last_check_attempt_at < now()-interval '5 minutes') RETURNING id", [platformId]);
  return claimed.rows.length > 0;
}

export async function checkOne(platform, options = {}) {
  const timeoutMs = Math.max(1000, Math.min(8000, Number(options.timeoutMs) || 8000));
  const target = safeTarget(platform.domain);
  if (!target) {
    const error = 'Check skipped: platform domain must be a public HTTPS hostname.';
    await db.query("INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,'unknown',NULL,NULL,$2,$2,now())", [platform.id,error]);
    return { platformId: platform.id, status: 'unknown', error };
  }
  const started = Date.now();
  let status = 'unknown', httpStatus = null, error = null, detail = '';
  try {
    const response = await fetch(target.toString(), {
      method: 'GET', redirect: 'manual', cache: 'no-store',
      headers: { 'user-agent': 'NEXORA-Platform-Pulse/1.0', 'accept': 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    const elapsed = Date.now() - started;
    httpStatus = response.status;
    if (httpStatus >= 200 && httpStatus <= 399) {
      status = elapsed > 3000 ? 'slow' : 'online';
      detail = httpStatus >= 300 ? 'HTTP redirect response (not followed)' : 'HTTP success response';
    } else if (httpStatus >= 500) {
      status = 'offline'; error = 'HTTP ' + httpStatus + ' server error'; detail = error;
    } else {
      status = 'unknown'; error = 'Unexpected HTTP ' + httpStatus + '; not treated as online.'; detail = error;
    }
    try { await response.body?.cancel(); } catch {}
    await db.query('INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,$2,$3,$4,$5,$6,now())', [platform.id,status,elapsed,httpStatus,error,detail]);
    return { platformId: platform.id, status, responseMs: elapsed, httpStatus, error };
  } catch (e) {
    const elapsed = Date.now() - started;
    error = String(e?.name === 'TimeoutError' || e?.name === 'AbortError' ? 'Request timed out after ' + Math.round(timeoutMs / 1000) + ' seconds.' : (e?.message || 'Network or DNS request failed.')).slice(0,500);
    status = 'offline'; detail = error;
    await db.query('INSERT INTO platform_checks(platform_id,status,response_ms,http_status,error,detail,checked_at) VALUES($1,$2,$3,NULL,$4,$5,now())', [platform.id,status,elapsed,error,detail]);
    return { platformId: platform.id, status, responseMs: elapsed, httpStatus: null, error };
  }
}