// ===== Circular Reveal/Conceal Transitions =====

function radiusToCover(cx, cy) {
  const w = window.innerWidth, h = window.innerHeight;
  const dx = Math.max(cx, w - cx);
  const dy = Math.max(cy, h - cy);
  return Math.hypot(dx, dy);
}

function setCenter(overlay, cx, cy) {
  overlay.style.setProperty('--cx', cx + 'px');
  overlay.style.setProperty('--cy', cy + 'px');
}

window.DreamFX = {
  revealFrom(el, done) {
    const overlay = document.getElementById('dream-reveal');
    if (!overlay || !el) return done?.();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setCenter(overlay, cx, cy);
    overlay.style.setProperty('--r', '0px');
    overlay.classList.add('active');
    overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    requestAnimationFrame(() => {
      const R = radiusToCover(cx, cy);
      overlay.style.clipPath = `circle(${R}px at ${cx}px ${cy}px)`;
      setTimeout(() => {
        overlay.classList.remove('active');
        done?.();
      }, 760);
    });
  },

  concealTo(el, done) {
    const overlay = document.getElementById('dream-reveal');
    if (!overlay || !el) return done?.();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const R = radiusToCover(cx, cy);
    setCenter(overlay, cx, cy);
    overlay.classList.add('active');
    overlay.style.clipPath = `circle(${R}px at ${cx}px ${cy}px)`;
    requestAnimationFrame(() => {
      overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
      setTimeout(() => {
        overlay.classList.remove('active');
        done?.();
      }, 760);
    });
  }
};

// ===== Enter/Sleep Transition Handlers =====
function initTransitions() {
  const intro = document.getElementById('intro');
  const siteHeader = document.getElementById('site-header');
  const mainSite = document.getElementById('site-main');
  const introDreamWindow = document.querySelector('#intro .dream-window');
  const enterBtn = document.getElementById('enter-site');
  const sleepLink = document.getElementById('sleep-link');

  function doEnter() {
    DreamFX.revealFrom(introDreamWindow, () => {
      intro.classList.add('fade-out');
      setTimeout(() => {
        intro.style.display = 'none';
        document.body.dataset.mode = 'main';
        siteHeader.hidden = false;
        mainSite.hidden = false;
        window.L2D && console.log("doEnter");
        window.L2D && window.L2D.requestLoop('main');
        try {
          window.starfieldConfig.speed = Math.max(window.starfieldConfig.speed, 4);
        } catch (e) {}
      }, 10);
    });
  }

  function doSleep() {
    intro.classList.remove('fade-out');
    intro.style.display = '';
    document.body.dataset.mode = 'intro';
    requestAnimationFrame(() => {
      DreamFX.concealTo(introDreamWindow, () => {
        siteHeader.hidden = true;
        mainSite.hidden = true;
        window.L2D && console.log("doSleep");
        window.L2D && window.L2D.requestLoop('sleep');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          const cfg = window.starfieldConfig;
          cfg.speed = Math.min(cfg.speed, 4);
          cfg.speed = Math.max(0.8, cfg.speed - 1.5);
        } catch (e) {}
      });
    });
  }

  enterBtn?.addEventListener('click', doEnter);
  introDreamWindow?.addEventListener('click', doEnter);
  sleepLink?.addEventListener('click', (e) => {
    e.preventDefault();
    doSleep();
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransitions);
} else {
  initTransitions();
}
