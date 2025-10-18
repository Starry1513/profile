// ===== Live2D Character Model Module =====

window.L2D = window.L2D || {
  inited: false,
  app: null,
  model: null,
  fit: null,
  setLoop: null,
  _pendingLoop: null
};

function requestLoop(name) {
  const L = window.L2D;
  if (L.inited && typeof L.setLoop === 'function') {
    L.setLoop(name, true);
  } else {
    L._pendingLoop = name;
  }
}
window.L2D.requestLoop = requestLoop;

async function initLive2D() {
  if (window.L2D.inited) return;
  if (!window.PIXI || !PIXI.live2d || !PIXI.live2d.Live2DModel) {
    console.error('PIXI / pixi-live2d-display not loaded');
    return;
  }

  const host = document.getElementById('l2d-container');
  if (!host) return;

  host.style.display = 'block';

  const app = new PIXI.Application({
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    resizeTo: host
  });
  host.appendChild(app.view);

  const MODEL_URL = './lafei_4/lafei_4.model3.json';
  const model = await PIXI.live2d.Live2DModel.from(MODEL_URL);
  app.stage.addChild(model);
  model.anchor.set(0.5, 1);

  function fit() {
    const w = host.clientWidth || 300;
    const h = host.clientHeight || 360;
    model.scale.set(1);
    const s = Math.min((w - 16) / model.width, (h - 16) / model.height);
    model.scale.set(s);
    model.x = w * 0.5 + 90;
    model.y = h - 180;
  }
  fit();

  const mm = model.internalModel.motionManager;

  const loops = {
    sleep: [['Main', 2]],
    login: [['Login', 0], ['Main', 2]],
    complete: [['Complete', 0]],
    main: [['Main', 0], ['Main', 1]],
    email: [['Email', 0]],
    main2: [['Main', 1]],
    mission: [['Mission', 0]],
  };

  let currentLoop = 'sleep';
  let idx = 0;

  function playNext() {
    const [group, index] = loops[currentLoop][idx];
    try {
      model.motion(group, index);
    } catch (e) {}
    idx = (idx + 1) % loops[currentLoop].length;
  }

  function setLoop(name, immediate = true) {
    if (!loops[name]) return;
    currentLoop = name;
    idx = 0;
    try {
      if (typeof mm.stopAllMotions === 'function') mm.stopAllMotions();
    } catch (e) {}
    if (immediate) playNext();
  }

  app.ticker.add(() => {
    const stopped = (typeof mm.isFinished === 'function') ? mm.isFinished() : !mm.isPlaying;
    if (stopped) playNext();
  });

  window.L2D.inited = true;
  window.L2D.app = app;
  window.L2D.model = model;
  window.L2D.fit = fit;
  window.L2D.setLoop = setLoop;
  window.L2D.requestLoop = requestLoop;

  if (window.L2D._pendingLoop) {
    setLoop(window.L2D._pendingLoop, true);
    window.L2D._pendingLoop = null;
  } else {
    console.log('login action start');
    setLoop('login', true);
  }

  // Click interactions
  let singleTimer = null;
  const SINGLE_DELAY = 220;

  function forceClick(groupOrAlias, index) {
    const mm = model.internalModel.motionManager;
    if (typeof mm.stopAllMotions === 'function') mm.stopAllMotions();
    if (index !== undefined) {
      console.log('[play] ', groupOrAlias);
      model.motion(groupOrAlias, index);
    } else {
      model.motion(groupOrAlias);
    }
  }

  app.view.addEventListener('click', () => {
    clearTimeout(singleTimer);
    singleTimer = setTimeout(() => {
      forceClick('TapBody');
    }, SINGLE_DELAY);
  });

  app.view.addEventListener('dblclick', () => {
    clearTimeout(singleTimer);
    singleTimer = null;
    forceClick('TapSpecial');
  });

  app.view.addEventListener('contextmenu', () => {
    clearTimeout(singleTimer);
    singleTimer = null;
    forceClick('TapHead');
  });

  const ro = new ResizeObserver(() => fit());
  ro.observe(host);
  window.addEventListener('resize', fit);
}

function showLive2D() {
  const host = document.getElementById('l2d-container');
  if (!host) return;
  if (!L2D.inited) {
    initLive2D();
  } else {
    host.style.display = 'block';
    requestAnimationFrame(() => L2D.fit && L2D.fit());
  }
}

// Utility functions for waiting
function waitUntilVisible(el) {
  return new Promise(resolve => {
    const tick = () => {
      const r = el.getBoundingClientRect();
      if (!el.hidden && r.width > 0 && r.height > 0) return resolve();
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function waitLibs() {
  return new Promise(resolve => {
    const tick = () => {
      if (window.PIXI && PIXI.live2d && PIXI.live2d.Live2DModel) return resolve();
      requestAnimationFrame(tick);
    };
    tick();
  });
}

// Auto-initialize on DOM ready
window.addEventListener('DOMContentLoaded', async () => {
  const host = document.getElementById('l2d-container');
  if (!host) return;
  host.style.display = 'block';
  await waitUntilVisible(host);
  await waitLibs();
  requestAnimationFrame(() => requestAnimationFrame(() => showLive2D()));
});
