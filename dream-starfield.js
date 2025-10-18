// ===== Small starfield inside the dream window =====
(function(){
  const c = document.getElementById('dream-sky');
  if(!c) return;
  const x = c.getContext('2d');
  let w, h, dpr;
  let stars = [];

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    const rect = c.parentElement.getBoundingClientRect();
    w = Math.floor(rect.width * dpr);
    h = Math.floor(rect.height * dpr);
    c.width = w;
    c.height = h;
    c.style.width = rect.width + 'px';
    c.style.height = rect.height + 'px';
    stars = Array.from({length: 80}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.8 + 0.4,
      t: Math.random()*Math.PI*2
    }));
  }

  function draw(){
    x.fillStyle = 'rgb(3,8,23)';
    x.fillRect(0,0,w,h);
    for(const s of stars){
      s.t += 0.04;
      const a = 0.5 + Math.sin(s.t)*0.5; // twinkle
      x.beginPath();
      x.arc(s.x, s.y, s.r, 0, Math.PI*2);
      x.fillStyle = 'rgba(255,255,255,'+a.toFixed(2)+')';
      x.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
