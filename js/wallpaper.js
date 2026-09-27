(() => {
  const canvas = document.getElementById('wallpaper-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let nodes = [];

  const colors = [
    'rgba(168,85,247,',
    'rgba(80,180,255,',
    'rgba(255,46,99,'
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(65, Math.max(25, Math.floor((w * h) / 18000)));

    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.4 + .5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = a.color + '.75)';
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 145) {
          const opacity = (1 - distance / 145) * .22;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.color + opacity + ')';
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);

  resize();
  draw();
})();
