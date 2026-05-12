/* ============================================
   Tracking Module — Telegram Webhooks
   Mario - Asistente Informático
   ============================================ */

// La configuración se carga desde js/config.js (ignorado en Git)
// Si no existe, se desactivará el rastreo por seguridad.
if (typeof TrackingConfig === 'undefined') {
  window.TrackingConfig = {
    ENABLED: false,
    ERROR: "Configuración no encontrada. Asegúrate de tener js/config.js"
  };
}


const Tracking = (() => {
  const STORAGE_KEY = 'mario_tracking_ts';

  function _isRateLimited() {
    try {
      const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      return Date.now() - last < TrackingConfig.RATE_LIMIT_MS;
    } catch { return false; }
  }

  function _updateTimestamp() {
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch { }
  }

  let _geoCache = null;

  async function _getExtendedInfo() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const artDate = new Date(utc + (3600000 * -3));
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = `${pad(artDate.getDate())}/${pad(artDate.getMonth() + 1)}/${artDate.getFullYear()} ${pad(artDate.getHours())}:${pad(artDate.getMinutes())}:${pad(artDate.getSeconds())}`;

    // Geo Info (cached)
    if (!_geoCache) {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        _geoCache = `${data.city}, ${data.country_name} (IP: ${data.ip})`;
      } catch {
        _geoCache = 'No disponible';
      }
    }

    // System Info
    const ua = navigator.userAgent;
    let os = "Otro";
    let osVer = "";

    if (ua.includes("Win")) {
      os = "Windows";
      const match = ua.match(/Windows NT ([\d.]+)/);
      if (match) {
        const v = match[1];
        const versions = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" };
        osVer = versions[v] || v;
      }
    } else if (ua.includes("Mac OS X")) {
      os = "macOS";
      const match = ua.match(/Mac OS X ([\d._]+)/);
      if (match) osVer = match[1].replace(/_/g, ".");
    } else if (ua.includes("Android")) {
      os = "Android";
      const match = ua.match(/Android ([\d.]+)/);
      if (match) osVer = match[1];
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
      os = "iOS";
      const match = ua.match(/OS ([\d_]+)/);
      if (match) osVer = match[1].replace(/_/g, ".");
    } else if (ua.includes("Linux")) {
      os = "Linux";
    }

    let browser = "Otro";
    let browserVer = "";

    if (ua.includes("Edg/")) {
      browser = "Edge";
      const match = ua.match(/Edg\/([\d.]+)/);
      if (match) browserVer = match[1].split(".")[0];
    } else if (ua.includes("Chrome") && !ua.includes("Edg")) {
      browser = "Chrome";
      const match = ua.match(/Chrome\/([\d.]+)/);
      if (match) browserVer = match[1].split(".")[0];
    } else if (ua.includes("Firefox")) {
      browser = "Firefox";
      const match = ua.match(/Firefox\/([\d.]+)/);
      if (match) browserVer = match[1].split(".")[0];
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browser = "Safari";
      const match = ua.match(/Version\/([\d.]+)/);
      if (match) browserVer = match[1].split(".")[0];
    }

    const systemString = `${os}${osVer ? " " + osVer : ""} | ${browser}${
      browserVer ? " " + browserVer : ""
    }`;

    return {
      referrer: document.referrer || "directo",
      timestamp: timestamp,
      geo: _geoCache,
      system: systemString,
      resolution: `${window.screen.width}x${window.screen.height}`,
      os,
      osVer,
      browser,
      browserVer,
    };
  }

  async function send(eventType, extraData = {}) {
    if (!TrackingConfig.ENABLED) return;
    if (_isRateLimited()) return;

    const info = await _getExtendedInfo();
    const lines = [`<b>${eventType}</b>`, `🕐 ${info.timestamp}`];

    if (eventType === "🏠 Visita al sitio") {
      lines.push(`📍 Ubicación: ${info.geo}`);
      lines.push(`💻 Sistema: ${info.system} (${info.resolution})`);
      lines.push(`🔗 Referrer: ${info.referrer}`);
    }

    if (extraData.program) lines.push(`🛠️ Programa: ${extraData.program}`);
    if (extraData.detail) lines.push(`📝 Detalle: ${extraData.detail}`);

    const text = lines.join("\n");

    try {
      _updateTimestamp();
      await fetch(
        `https://asis-remota-tracking.mariogui.workers.dev/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            parse_mode: "HTML",
          }),
        }
      );
    } catch (e) {
      // Silently fail — never block UI
    }
  }

  return { send, getSystemInfo: _getExtendedInfo };
})();
