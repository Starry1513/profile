// ===== Navigation and Page Transitions =====

function enterMainThen(loopName, targetId) {
  const intro = document.getElementById('intro');
  const siteHeader = document.getElementById('site-header');
  const mainSite = document.getElementById('site-main');
  const introDreamWindow = document.querySelector('#intro .dream-window');

  const go = () => {
    try {
      window.L2D && window.L2D.requestLoop && window.L2D.requestLoop(loopName);
    } catch (e) {}
    const sec = document.getElementById(targetId);
    sec && sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      window.starfieldConfig.speed = Math.max(window.starfieldConfig.speed, 4);
    } catch (e) {}
  };

  if (document.body.dataset.mode === 'main') {
    go();
    return;
  }

  window.DreamFX.revealFrom(introDreamWindow, () => {
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      document.body.dataset.mode = 'main';
      siteHeader.hidden = false;
      mainSite.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(go));
    }, 10);
  });
}

function initNavigation() {
  const aboutLinks = document.querySelectorAll('a[href="#about"]');
  const contactLinks = document.querySelectorAll('a[href="#contact"]');
  const skillsLinks = document.querySelectorAll('a[href="#skills"]');
  const projectsLinks = document.querySelectorAll('a[href="#projects"]');

  // About -> complete loop
  aboutLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterMainThen('complete', 'about');
    });
  });

  // Contact -> email loop
  contactLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterMainThen('email', 'contact');
    });
  });

  // Skills -> main2 loop
  skillsLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterMainThen('main2', 'skills');
    });
  });

  // Projects -> mission loop
  projectsLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterMainThen('mission', 'projects');
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}
