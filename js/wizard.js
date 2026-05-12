/* ============================================
   Wizard Logic — Step Navigation & Interactions
   Mario - Asistente Informático
   ============================================ */

const Wizard = (() => {
  let currentStep = 0;
  let selectedProgram = null;
  const totalSteps = 5;
  const history = [];

  /* --- DOM References --- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* --- Welcome Animation --- */
  function initWelcome() {
    const overlay = $('.welcome-overlay');
    if (!overlay) return;

    Tracking.send('🏠 Visita al sitio');

    setTimeout(() => {
      overlay.classList.add('hidden');
      setTimeout(() => { overlay.remove(); }, 800);
      showStep(1);
    }, 2500);
  }

  /* --- Step Navigation --- */
  function showStep(step) {
    $$('.wizard-step').forEach((el) => {
      el.classList.remove('active');
    });

    const target = $(`#step-${step}`);
    if (target) {
      target.classList.remove('active');
      // Force reflow for animation restart
      void target.offsetWidth;
      target.classList.add('active');

      // Focus management for accessibility
      const heading = target.querySelector('.step-title, h2, h3');
      if (heading) heading.focus({ preventScroll: true });
    }

    currentStep = step;
    updateProgress();
  }

  function goTo(step, trackMsg) {
    history.push(currentStep);
    if (trackMsg) Tracking.send(trackMsg);
    showStep(step);
  }

  function goBack() {
    const prev = history.pop();
    if (prev !== undefined) {
      showStep(prev);
    }
  }

  /* --- Progress Bar --- */
  function updateProgress() {
    $$('.progress-dot').forEach((dot, i) => {
      const stepNum = i + 1;
      dot.classList.remove('active', 'completed');
      if (stepNum === currentStep) dot.classList.add('active');
      else if (stepNum < currentStep) dot.classList.add('completed');
    });

    $$('.progress-line').forEach((line, i) => {
      line.classList.toggle('active', i + 1 < currentStep);
    });
  }

  /* --- Program Selection --- */
  function selectProgram(program) {
    selectedProgram = program;

    // Show the appropriate guide
    const rustdeskGuide = $('#guide-rustdesk');
    const helpwireGuide = $('#guide-helpwire');

    if (rustdeskGuide) rustdeskGuide.style.display = program === 'rustdesk' ? 'block' : 'none';
    if (helpwireGuide) helpwireGuide.style.display = program === 'helpwire' ? 'block' : 'none';

    const label = program === 'rustdesk' ? 'RustDesk' : 'Helpwire';
    goTo(3, `📥 Seleccionó programa: ${label}`);
  }

  /* --- Download --- */
  function downloadProgram(program) {
    let url = '';

    if (program === 'rustdesk') {
      const ua = navigator.userAgent;
      if (ua.includes('Win')) {
        url = 'https://github.com/rustdesk/rustdesk/releases/download/1.4.6/rustdesk-1.4.6-x86_64.exe';
      } else if (ua.includes('Mac')) {
        url = 'https://github.com/rustdesk/rustdesk/releases/download/1.4.6/rustdesk-1.4.6-x86_64.dmg';
      } else if (ua.includes('Android')) {
        url = 'https://github.com/rustdesk/rustdesk/releases/download/1.4.6/rustdesk-1.4.6-universal-signed.apk';
      } else {
        url = 'https://rustdesk.com'; // Fallback a la web oficial
      }
    } else if (program === 'helpwire') {
      url = 'https://www.helpwire.app/builds/?token=lyX0OaxyMV76N5DKyKROptyQqpXojjzCgMNxDKKP';
    }

    Tracking.send('⬇️ Descarga iniciada', { program, detail: `URL: ${url}` });
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /* --- Toast --- */
  function showToast(message, duration = 2500) {
    const toast = $('#toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

  /* --- FAQ Toggle --- */
  function toggleFaq(el) {
    const item = el.closest('.faq-item');
    if (!item) return;

    const isOpen = item.classList.contains('open');
    // Close all
    $$('.faq-item').forEach((faq) => faq.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  }

  /* --- Other Button Handler --- */
  function handleOther() {
    const overlay = $('#floating-menu-overlay');
    if (overlay) overlay.classList.add('active');
    Tracking.send('🔘 Clic en Otros Servicios');
  }

  function closeOther(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('close-floating')) return;
    const overlay = $('#floating-menu-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function handleFloating(type, label) {
    showToast(`${label} — Próximamente`);
    Tracking.send(`🔘 Clic en Flotante: ${label}`);
  }

  /* --- IA / Meme Handler --- */
  const MEMES = [
    'img/memes/Sarah.jpg',
    'img/memes/arnold.jpg',
    'img/memes/meme-ia-laburar-300x300.webp',
    'img/memes/skynet.jpeg',
    'img/memes/verificacion.webp'
  ];

  function handleIA() {
    const overlay = $('#meme-overlay');
    const img = $('#meme-img');
    if (overlay && img) {
      const randomMeme = MEMES[Math.floor(Math.random() * MEMES.length)];
      img.src = randomMeme;
      overlay.classList.add('active');
    }
    Tracking.send('🤖 Clic en IA (Meme)');
  }

  function closeMeme(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('close-floating')) return;
    const overlay = $('#meme-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  /* --- Contact Handlers --- */
  function handleWhatsApp() {
    Tracking.send('💬 Clic en WhatsApp');
    showToast('📱 WhatsApp — Próximamente');
  }

  function handleChat() {
    Tracking.send('💬 Clic en Chat');
    showToast('💬 Chat — Próximamente');
  }

  /* --- Payment & Query --- */
  function handlePayment() {
    Tracking.send('💳 Clic en Opciones de Pago');
    showToast('💳 Opciones de pago — Próximamente');
  }

  function handleNewQuery() {
    Tracking.send('🔄 Otra consulta');
    history.length = 0;
    selectedProgram = null;
    showStep(1);
  }

  /* --- Init --- */
  function init() {
    initWelcome();

    // Keyboard navigation for FAQ
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.faq-item').forEach((faq) => faq.classList.remove('open'));
      }
    });
  }

  // Public API
  return {
    init,
    goTo,
    goBack,
    selectProgram,
    downloadProgram,
    showToast,
    toggleFaq,
    handleOther,
    closeOther,
    handleFloating,
    handleIA,
    closeMeme,
    handleWhatsApp,
    handleChat,
    handlePayment,
    handleNewQuery,
  };
})();

document.addEventListener('DOMContentLoaded', Wizard.init);
