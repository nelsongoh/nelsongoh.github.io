/* Own analytics: one visit per tab session, one visitor per browser storage. */
(() => {
  'use strict';
  const endpoint = 'https://personal-brand-analytics.personal-brand-analytics-worker.workers.dev';
  const panel = document.querySelector('[data-visitor-counter]');
  if (!endpoint || !panel || location.origin !== 'https://nelsongoh.github.io') return;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const key = 'personal-brand.analytics.v1';
  let visitorId, visitId, counted = false;
  try {
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') throw new Error('Opt out');
    visitorId = localStorage.getItem(key + '.visitor');
    if (!uuid.test(visitorId || '')) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key + '.visitor', visitorId);
    }
    visitId = sessionStorage.getItem(key + '.visit');
    if (!uuid.test(visitId || '')) {
      visitId = crypto.randomUUID();
      sessionStorage.setItem(key + '.visit', visitId);
    }
    counted = sessionStorage.getItem(key + '.counted') === visitId;
  } catch {
    // Read totals only if storage is unavailable or the browser requests privacy.
    visitorId = null;
  }
  const record = Boolean(visitorId && !counted);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  fetch(endpoint, {
    method: record ? 'POST' : 'GET',
    ...(record ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId, visitId }) } : {}),
    credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: controller.signal,
  }).then(async response => {
    if (!response.ok) throw new Error('Counter unavailable');
    const data = await response.json();
    if (![data.totalVisits, data.uniqueVisitors].every(n => Number.isSafeInteger(n) && n >= 0) || data.uniqueVisitors > data.totalVisits) throw new Error('Invalid count');
    if (record) {
      try { sessionStorage.setItem(key + '.counted', visitId); } catch { /* Server deduplicates retries. */ }
    }
    panel.querySelector('[data-total-visits]').textContent = data.totalVisits.toLocaleString();
    panel.querySelector('[data-unique-visitors]').textContent = data.uniqueVisitors.toLocaleString();
    panel.hidden = false;
  }).catch(() => { /* Keep the footer quiet if the counter is unavailable. */ })
    .finally(() => clearTimeout(timeout));
})();
