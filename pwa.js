'use strict';
(() => {
 const status = document.getElementById('pwaStatus');
 const update = document.getElementById('applyUpdate');
 if (!status || !update) return;
 if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) {
   status.textContent = '이 환경에서는 오프라인 설치를 지원하지 않아요. 기록과 백업은 사용할 수 있습니다.'; return;
 }
 let ready = false, waiting = null, refreshing = false;
 const show = () => { status.textContent = ready ? (navigator.onLine ? '✓ 오프라인 준비 완료 · 기록은 이 기기에만 저장' : '✓ 오프라인으로 사용 중 · 기록은 이 기기에 저장') : '오프라인 사용 준비 중…'; };
 window.addEventListener('online', show); window.addEventListener('offline', show);
 navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) location.reload(); });
 update.addEventListener('click', () => { if (waiting) { refreshing = true; update.disabled = true; waiting.postMessage({type:'SKIP_WAITING'}); } });
 navigator.serviceWorker.register('./sw.js', {scope:'./'}).then(registration => {
   const offer = () => { if (registration.waiting && navigator.serviceWorker.controller) { waiting = registration.waiting; update.hidden = false; } };
   offer();
   registration.addEventListener('updatefound', () => { const worker = registration.installing; if(worker) worker.addEventListener('statechange', () => { if(worker.state === 'installed') offer(); }); });
   navigator.serviceWorker.ready.then(() => { ready = true; show(); });
 }).catch(() => { status.textContent = '오프라인 준비에 실패했어요. 인터넷 연결 후 다시 열어 주세요. 기록은 기기에 저장됩니다.'; });
})();
