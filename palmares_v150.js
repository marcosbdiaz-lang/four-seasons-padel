// FOUR SEASONS PÁDEL · PALMARÉS V150
// Solo presentación: indicador de espera mientras V149 comprueba el vídeo.
// No realiza peticiones, no escribe datos y no modifica V149 ni los resultados.
(function () {
  'use strict';
  const LOADING_CLASS = 'videoCargaV150';
  const FINAL_CLASS = 'videoAvisoV149';
  const NO_RESULT_TIMEOUT_MS = 25000;
  const STYLE_ID = 'palmares-video-carga-v150-css';
  if (!document.getElementById(STYLE_ID)) {
    const css = document.createElement('style');
    css.id = STYLE_ID;
    css.textContent = `
      .${LOADING_CLASS} {display:block;margin-top:9px;padding:8px 10px;border:1px solid #415b50;border-radius:9px;background:#10231c;color:#afd9c4;font-size:11px;font-weight:800;white-space:normal}
      .${LOADING_CLASS}::before {content:'';display:inline-block;width:11px;height:11px;margin-right:7px;vertical-align:-1px;border:2px solid #5f8974;border-top-color:#e4c667;border-radius:50%;animation:videoCarga150 .9s linear infinite}
      .${LOADING_CLASS}.error::before {display:none}
      @keyframes videoCarga150 {to{transform:rotate(360deg)}}
      @media(prefers-reduced-motion:reduce){.${LOADING_CLASS}::before{animation:none}}
    `;
    document.head.appendChild(css);
  }

  let currentHost = null;
  let observer = null;
  const since = new WeakMap();

  function updateRow(row) {
    const target = row.querySelector('.result');
    if (!target) return;
    const youtube = target.querySelector('.matchYoutube');
    const decided = target.querySelector('.' + FINAL_CLASS);
    const placeholder = target.querySelector('.' + LOADING_CLASS);
    if (youtube || decided) {
      if (placeholder) placeholder.remove();
      since.delete(row);
      return;
    }
    if (!placeholder) {
      const notice = document.createElement('span');
      notice.className = LOADING_CLASS;
      notice.setAttribute('role', 'status');
      notice.textContent = 'CARGANDO VÍDEO…';
      target.appendChild(notice);
      since.set(row, Date.now());
      return;
    }
    if (Date.now() - (since.get(row) || Date.now()) > NO_RESULT_TIMEOUT_MS && !placeholder.classList.contains('error')) {
      placeholder.classList.add('error');
      placeholder.textContent = 'NO SE PUDO COMPROBAR EL VÍDEO · RECARGA PARA REINTENTAR';
    }
  }

  function inspect() {
    const host = document.querySelector('.finalHistory');
    if (!host) return;
    if (host !== currentHost) {
      if (observer) observer.disconnect();
      currentHost = host;
      observer = new MutationObserver(inspect);
      observer.observe(host, {childList:true, subtree:true});
    }
    host.querySelectorAll(':scope > .finalRow').forEach(updateRow);
  }

  // También cubre el estado inicial antes de que V149 termine sus consultas.
  inspect();
  const interval = setInterval(inspect, 600);
  setTimeout(() => clearInterval(interval), 90000);
})();
