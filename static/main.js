(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.addEventListener('click', function (event) {
    const clickedElement = event.target instanceof Element ? event.target.closest('[data-analytics-event]') : null;
    if (!clickedElement || typeof window.gtag !== 'function') return;
    window.gtag('event', clickedElement.dataset.analyticsEvent);
  });

  const canvas = document.getElementById('background-canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -1000, y: -1000, active: false };
  const particles = [];
  const wind = [];
  const comets = [];
  let width = 0;
  let height = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let animation = 0;
  let lastFrame = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const targetCount = Math.max(52, Math.min(160, Math.round((width * height) / 10000)));
    particles.length = 0;
    for (let i = 0; i < targetCount; i += 1) {
      particles.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.16, 0.16),
        vy: random(-0.16, 0.16),
        radius: random(0.7, 1.9),
        phase: random(0, Math.PI * 2),
        tint: Math.random() > 0.5 ? '118, 224, 255' : '190, 157, 255'
      });
    }
    wind.length = 0;
    for (let i = 0; i < 24; i += 1) wind.push(createWind());
    comets.length = 0;
    for (let i = 0; i < 3; i += 1) {
      const comet = {};
      resetComet(comet, i === 0);
      comets.push(comet);
    }
    draw(0, true);
  }

  function createWind() {
    return {
      x: random(0, width),
      y: random(0, height),
      vx: random(0.22, 0.58),
      vy: random(0.05, 0.2),
      length: random(10, 34),
      alpha: random(0.035, 0.095)
    };
  }

  function resetComet(comet, initial = false) {
    const speed = random(1.45, 2.35);
    if (initial) {
      comet.x = random(width * 0.12, width * 0.88);
      comet.y = random(height * 0.08, height * 0.72);
      const angle = random(0, Math.PI * 2);
      comet.vx = Math.cos(angle) * speed;
      comet.vy = Math.sin(angle) * speed;
    } else {
      const edge = Math.floor(random(0, 4));
      const spread = random(-0.65, 0.65);
      const angle = [
        spread,
        Math.PI + spread,
        Math.PI / 2 + spread,
        -Math.PI / 2 + spread
      ][edge];
      comet.x = edge === 0 ? -20 : edge === 1 ? width + 20 : random(0, width);
      comet.y = edge === 2 ? -20 : edge === 3 ? height + 20 : random(0, height);
      comet.vx = Math.cos(angle) * speed;
      comet.vy = Math.sin(angle) * speed;
    }
    comet.length = random(100, 165);
    comet.alpha = random(0.5, 0.74);
    comet.wait = initial ? 0 : random(2200, 5200);
  }

  function drawSpaceWind(still) {
    for (const wisp of wind) {
      if (!still) {
        wisp.x += wisp.vx;
        wisp.y += wisp.vy;
        if (wisp.x > width + wisp.length || wisp.y > height + wisp.length) {
          wisp.x = random(-wisp.length, width * 0.35);
          wisp.y = random(-wisp.length, height * 0.45);
        }
      }

      const headX = wisp.x + parallaxX * 0.45;
      const headY = wisp.y + parallaxY * 0.45;
      const tailX = headX - wisp.length;
      const tailY = headY - wisp.length * 0.34;
      const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, 'rgba(136, 210, 255, 0)');
      gradient.addColorStop(1, `rgba(170, 224, 255, ${wisp.alpha})`);
      context.beginPath();
      context.strokeStyle = gradient;
      context.lineWidth = 0.8;
      context.moveTo(tailX, tailY);
      context.lineTo(headX, headY);
      context.stroke();
    }
  }

  function drawComets(still) {
    for (const comet of comets) {
      if (!still && comet.wait > 0) {
        comet.wait = Math.max(0, comet.wait - 30);
        continue;
      }
      if (!still) {
        comet.x += comet.vx;
        comet.y += comet.vy;
      }

      const headX = comet.x + parallaxX * 0.7;
      const headY = comet.y + parallaxY * 0.7;
      const tailX = headX - comet.vx * comet.length;
      const tailY = headY - comet.vy * comet.length;
      const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, 'rgba(171, 219, 255, 0)');
      gradient.addColorStop(0.72, `rgba(186, 222, 255, ${comet.alpha * 0.32})`);
      gradient.addColorStop(1, `rgba(229, 246, 255, ${comet.alpha})`);
      context.beginPath();
      context.strokeStyle = gradient;
      context.lineWidth = 1.65;
      context.moveTo(tailX, tailY);
      context.lineTo(headX, headY);
      context.stroke();

      context.beginPath();
      context.fillStyle = `rgba(231, 247, 255, ${comet.alpha})`;
      context.shadowColor = 'rgba(161, 220, 255, .8)';
      context.shadowBlur = 12;
      context.arc(headX, headY, 1.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      if (!still && (comet.x < -comet.length || comet.x > width + comet.length || comet.y < -comet.length || comet.y > height + comet.length)) {
        resetComet(comet);
      }
    }
  }

  function draw(time, still = false) {
    if (!still) {
      const targetX = pointer.active ? (0.5 - pointer.x / width) * 24 : 0;
      const targetY = pointer.active ? (0.5 - pointer.y / height) * 18 : 0;
      parallaxX += (targetX - parallaxX) * 0.045;
      parallaxY += (targetY - parallaxY) * 0.045;
    }

    context.clearRect(0, 0, width, height);
    drawSpaceWind(still);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      const drawX = particle.x + parallaxX;
      const drawY = particle.y + parallaxY;
      const wave = still ? 0.72 : 0.55 + (Math.sin(time * 0.0007 + particle.phase) + 1) * 0.22;
      const dx = drawX - pointer.x;
      const dy = drawY - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!still) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (pointer.active && distance < 145 && distance > 0) {
          const force = (1 - distance / 145) * 0.008;
          particle.x += (dx / distance) * force * 18;
          particle.y += (dy / distance) * force * 18;
        }

        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;
      }

      context.beginPath();
      context.fillStyle = `rgba(${particle.tint}, ${wave})`;
      context.shadowColor = `rgba(${particle.tint}, ${wave})`;
      context.shadowBlur = particle.radius > 1.4 ? 13 : 7;
      context.arc(drawX, drawY, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const otherX = other.x + parallaxX;
        const otherY = other.y + parallaxY;
        const lineX = drawX - otherX;
        const lineY = drawY - otherY;
        const lineDistance = Math.sqrt(lineX * lineX + lineY * lineY);
        if (lineDistance < 112) {
          const alpha = (1 - lineDistance / 112) * 0.19;
          context.beginPath();
          context.strokeStyle = `rgba(169, 196, 255, ${alpha})`;
          context.lineWidth = 0.7;
          context.moveTo(drawX, drawY);
          context.lineTo(otherX, otherY);
          context.stroke();
        }
      }
    }

    drawComets(still);
  }

  function animate(time) {
    if (document.hidden || reducedMotion.matches) {
      animation = 0;
      return;
    }
    if (time - lastFrame > 30) {
      draw(time);
      lastFrame = time;
    }
    animation = window.requestAnimationFrame(animate);
  }

  function start() {
    if (!animation && !document.hidden && !reducedMotion.matches) {
      animation = window.requestAnimationFrame(animate);
    } else if (reducedMotion.matches) {
      draw(0, true);
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', function () {
    pointer.active = false;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (animation) window.cancelAnimationFrame(animation);
      animation = 0;
    } else {
      start();
    }
  });
  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      if (animation) window.cancelAnimationFrame(animation);
      animation = 0;
      draw(0, true);
    } else {
      start();
    }
  });

  resize();
  start();
}());
