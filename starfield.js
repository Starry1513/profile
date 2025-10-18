// ======= Starfield Background (optimized & beginner-friendly) =======
const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');

const cfg = {
  focalLength: 400,       // Focal length (updated based on screen size in resize())
  mouseInfluence: 0.22,   // Mouse influence coefficient
  speed: 1.0,             // Base speed, adjustable with scroll wheel
  maxStarSize: 8,         // Maximum star radius
  fadeStartZ: 220,        // Distance where fading starts
  fadeEndZ: 90            // Distance where completely disappears
};

let stars = [];
let cx = 0, cy = 0;      // Canvas center (in pixels)
let mx = 0, my = 0;      // Mouse offset relative to center

function createStars(count) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
    o: 0.6 + Math.random() * 0.4, // Opacity 0.3~1.0
    px: 0, py: 0, pz: 0           // Previous frame coordinates (for trails)
  }));
}

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  canvas.width = w; canvas.height = h;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  cx = w / 2; cy = h / 2;
  cfg.focalLength = Math.min(w, h) * 0.9; // Update focal length based on canvas

  // Adaptive quantity: density (one star per 2,200 pixels), limited between 800~4000
  const density = 800;
  const target = Math.max(800, Math.min(4000, Math.floor((w * h) / density)));
  createStars(target);
}

function pos(x, y, z) {
  const scale = cfg.focalLength / z;
  return {
    x: (x - cx) * scale + cx,
    y: (y - cy) * scale + cy,
    r: Math.min(cfg.maxStarSize, scale) // Radius
  };
}

function alpha(z) {
  if (z <= cfg.fadeStartZ) {
    return Math.max(0, Math.min(1, (z - cfg.fadeEndZ) / (cfg.fadeStartZ - cfg.fadeEndZ)));
  }
  return 1;
}

function move() {
  const len = stars.length;
  for (let i = 0; i < len; i++) {
    const s = stars[i];
    // Save previous frame
    s.px = s.x; s.py = s.y; s.pz = s.z;
    // Move towards observer
    s.z -= cfg.speed;
    // Mouse micro-offset (decreases with z)
    s.x += (mx * cfg.mouseInfluence) / Math.max(60, s.z);
    s.y += (my * cfg.mouseInfluence) / Math.max(60, s.z);

    // Reset (return to far distance after passing through lens)
    if (s.z <= cfg.fadeEndZ) {
      s.z = canvas.width;
      s.x = Math.random() * canvas.width;
      s.y = Math.random() * canvas.height;
      s.px = s.x; s.py = s.y; s.pz = s.z;
    }
  }
}

function draw() {
  // Background clear
  ctx.fillStyle = 'rgb(0,10,20)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fast = cfg.speed > 10; // Draw trails only at high speed
  const len = stars.length;
  for (let i = 0; i < len; i++) {
    const s = stars[i];
    const curr = pos(s.x, s.y, s.z);
    const a = alpha(s.z) * s.o;

    if (fast) {
      const prev = pos(s.px, s.py, s.pz);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.strokeStyle = `rgba(255,255,255,${0.28 * a})`;
      ctx.lineWidth = curr.r;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(curr.x, curr.y, curr.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  }
}

function loop() {
  move();
  draw();
  requestAnimationFrame(loop);
}

// Events
window.addEventListener('resize', resize);
document.addEventListener('mousemove', (e) => {
  mx = (e.clientX * (window.devicePixelRatio || 1)) - cx;
  my = (e.clientY * (window.devicePixelRatio || 1)) - cy;
});
document.addEventListener('wheel', (e) => {
  cfg.speed = Math.max(0.1, Math.min(50, cfg.speed - e.deltaY * 0.01));
}, { passive: true });

// Init
resize();
loop();

// Export config for external control
window.starfieldConfig = cfg;
