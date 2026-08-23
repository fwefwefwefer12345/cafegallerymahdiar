// Cafe Mahdiar - High-Performance 3D Visuals & Animations
// Optimized for Low/Mid-End Mobile Devices (60 FPS, Zero Idle Lag)

const galleryImages = [
  "assets/images/gallery-1.webp",
  "assets/images/gallery-2.webp",
  "assets/images/gallery-3.webp",
  "assets/images/gallery-4.webp",
  "assets/images/gallery-5.webp",
  "assets/images/gallery-6.webp",
  "assets/images/gallery-7.webp",
  "assets/images/gallery-8.webp"
];

// ---------- 1. 3D Round Carousel (Gallery) ----------
(function () {
  const images = galleryImages;
  const count = images.length;
  if (!count) return;

  const wrap = document.getElementById('round-carousel');
  if (!wrap) return;

  const isMobile = window.innerWidth <= 768;
  const imageWidth = isMobile ? 220 : 300;
  const imageHeight = isMobile ? 220 : 300;
  const spacing = 2.5;
  const speed = 2.5;
  const direction = 'right';
  const tilt = -7;
  const perspective = 2500;
  const cornerRadius = 18;
  const innerDim = 3.5;

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const degPerSec = speed * 6 * (direction === 'left' ? -1 : 1);

  wrap.style.perspective = perspective + 'px';

  const tiltEl = document.createElement('div');
  tiltEl.className = 'carousel-tilt';
  tiltEl.style.transform = `rotateX(${tilt}deg)`;
  wrap.appendChild(tiltEl);

  const ring = document.createElement('div');
  ring.className = 'carousel-ring';
  ring.style.width = imageWidth + 'px';
  ring.style.height = imageHeight + 'px';
  tiltEl.appendChild(ring);

  images.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;

    const front = document.createElement('div');
    front.className = 'carousel-face';
    front.style.borderRadius = cornerRadius + 'px';
    front.style.backgroundImage = `url(${src})`;

    const back = document.createElement('div');
    back.className = 'carousel-face back';
    back.style.borderRadius = cornerRadius + 'px';
    back.style.backgroundImage = `url(${src})`;
    back.style.filter = `brightness(${innerDim / 10})`;

    item.appendChild(front);
    item.appendChild(back);
    ring.appendChild(item);
  });

  let rotY = 0;
  let vel = 0;
  let lastT = 0;
  let isVisible = true;
  let raf = 0;
  const dragState = { active: false, x: 0, lastX: 0, lastTime: 0 };

  function apply() {
    ring.style.transform = `translateZ(${-radius}px) rotateY(${rotY}deg)`;
  }
  apply();

  function frame(now) {
    if (!isVisible) { raf = 0; return; }
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0;
    lastT = now;

    if (!dragState.active) {
      if (Math.abs(vel) > 0.05) {
        rotY += vel * dt;
        vel *= 0.90; // Smooth deceleration
      } else {
        vel = 0;
        rotY += degPerSec * dt;
      }
    }
    apply();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // Viewport Culling: Stop rendering when off-screen to save 100% CPU
  if ('IntersectionObserver' in window) {
    const galleryObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        isVisible = e.isIntersecting;
        if (isVisible && !raf) {
          lastT = performance.now();
          raf = requestAnimationFrame(frame);
        }
      });
    }, { threshold: 0.05 });
    galleryObs.observe(wrap);
  }

  // Smooth mobile touch & drag controls
  wrap.style.cursor = 'grab';
  wrap.style.touchAction = 'none';

  const onDown = (clientX) => {
    dragState.active = true;
    dragState.x = clientX;
    dragState.lastX = clientX;
    dragState.lastTime = performance.now();
    vel = 0;
  };

  const onMove = (clientX) => {
    if (!dragState.active) return;
    const now = performance.now();
    const dt = Math.max(0.01, (now - dragState.lastTime) / 1000);
    const dx = clientX - dragState.x;
    const stepDx = clientX - dragState.lastX;

    dragState.x = clientX;
    dragState.lastX = clientX;
    dragState.lastTime = now;

    const k = 0.20;
    rotY += dx * k;

    const instantVel = (stepDx * k) / dt;
    vel = Math.max(-90, Math.min(90, instantVel * 0.75));
  };

  const onUp = () => {
    dragState.active = false;
  };

  wrap.addEventListener('pointerdown', e => {
    wrap.setPointerCapture?.(e.pointerId);
    onDown(e.clientX);
  });
  wrap.addEventListener('pointermove', e => onMove(e.clientX));
  wrap.addEventListener('pointerup', e => {
    wrap.releasePointerCapture?.(e.pointerId);
    onUp();
  });
  wrap.addEventListener('pointercancel', onUp);
})();


// ---------- 2. Infinite 3D Tunnel in Hero (Three.js with Food Images & Viewport Culling) ----------
(function () {
  function initTunnel() {
    const host = document.querySelector('.hero');
    const canvas = document.getElementById('kinetic-grid');
    if (!host || !canvas) return;
    if (typeof THREE === 'undefined') {
      setTimeout(initTunnel, 50);
      return;
    }

    const isMobile = window.innerWidth <= 768;

    // High quality food and cafe item slides
    const SLIDES = [
      { url: "assets/images/tunnel-1.webp", y: 45 },
      { url: "assets/images/tunnel-2.webp", y: 50 },
      { url: "assets/images/tunnel-3.webp", y: 40 },
      { url: "assets/images/tunnel-4.webp", y: 55 },
      { url: "assets/images/tunnel-5.webp", y: 50 },
      { url: "assets/images/tunnel-6.webp", y: 40 },
      { url: "assets/images/tunnel-7.webp", y: 45 },
      { url: "assets/images/tunnel-8.webp", y: 55 },
      { url: "assets/images/tunnel-9.webp", y: 50 },
      { url: "assets/images/tunnel-10.webp", y: 50 },
      { url: "assets/images/tunnel-11.webp", y: 50 },
      { url: "assets/images/tunnel-12.webp", y: 45 },
      { url: "assets/images/tunnel-13.webp", y: 45 }
    ];

    // Elegant cafe warm palette for fallback/borders (Dark coffee, rich gold, warm amber)
    const PALETTE = ['#241a12', '#372718', '#c99a45', '#1c130d'];
    const BACKGROUND = '#1c130d';
    const LINE_COLOR = '#c99a45';
    const LINE_OPACITY = 30;
    const GRID = isMobile ? 3 : 4;
    const TUNNEL_SIZE_UI = isMobile ? 7.5 : 9;

    // Calibrated speed in units/second for balanced, dynamic gliding
    const SPEED_Z = 1.85;
    const FADE = 50; // Gentle distance fade so items remain visible for longer

    const TUNNEL_WIDTH = isMobile ? 1.35 : 2.0;
    const TUNNEL_HEIGHT = isMobile ? 1.65 : 1.8;
    const BASE_SEGMENT_DEPTH = 1, TUNNEL_LENGTH = isMobile ? 12 : 16;
    const LINE_RADIUS = 0.003;
    const fogFarFor = (segCount, segDepth) => segCount * segDepth * 0.95;

    let alive = true;
    let isHeroVisible = true;

    const sizeK = 1 + ((TUNNEL_SIZE_UI - 1) * 2) / 19;
    const rows = Math.max(1, Math.round(GRID));
    const cols = rows;
    const depthCells = 1;
    const segDepth = BASE_SEGMENT_DEPTH;
    const cellDepth = BASE_SEGMENT_DEPTH;
    const tunnelW = TUNNEL_WIDTH * sizeK;
    const tunnelH = TUNNEL_HEIGHT * sizeK;
    const colW = tunnelW / cols;
    const rowH = tunnelH / rows;

    const segCount = Math.max(6, Math.round(TUNNEL_LENGTH / segDepth));
    const fillChance = 0.72;
    const fogFar = fogFarFor(segCount, segDepth);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND);
    const fogNear = Math.min(fogFar * (1 - Math.min(100, Math.max(0, FADE)) / 100), fogFar - 0.01);
    scene.fog = new THREE.Fog(new THREE.Color(BACKGROUND), fogNear, fogFar);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(LINE_COLOR),
      transparent: true,
      opacity: Math.max(0, Math.min(100, LINE_OPACITY)) / 100
    });

    const hw = tunnelW / 2, hh = tunnelH / 2;
    const geoFloor = new THREE.PlaneGeometry(colW, cellDepth);
    const geoWall = new THREE.PlaneGeometry(cellDepth, rowH);

    const tubeRadSegs = isMobile ? 4 : 6;
    const railLength = segCount * segDepth + segDepth;
    const geoTubeZ = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -railLength)), 1, LINE_RADIUS, tubeRadSegs);
    const geoTubeX = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(tunnelW, 0, 0)), 1, LINE_RADIUS, tubeRadSegs);
    const geoTubeY = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, tunnelH, 0)), 1, LINE_RADIUS, tubeRadSegs);

    const colorMats = PALETTE.map(hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), side: THREE.DoubleSide }));

    // Preload and create image materials for food photos with sharp anisotropic filtering
    const imageMats = SLIDES.map(({ url, y }) => {
      const mat = new THREE.MeshBasicMaterial({ transparent: false, side: THREE.DoubleSide });
      loader.load(url, (tex) => {
        if (!alive) { tex.dispose(); return; }
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = Math.min(8, maxAnisotropy);
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;

        const iw = tex.image?.width || 1, ih = tex.image?.height || 1;
        const aspect = iw / ih;
        if (aspect > 1) {
          tex.repeat.set(1 / aspect, 1);
          tex.offset.set((1 - 1 / aspect) / 2, 0);
        } else {
          const rY = aspect;
          const anchor = Math.max(0, Math.min(100, y || 50)) / 100;
          tex.repeat.set(1, rY);
          tex.offset.set(0, (1 - rY) * (1 - anchor));
        }
        mat.map = tex;
        mat.needsUpdate = true;
      }, undefined, () => { });
      return mat;
    });

    let populateIndex = 0, colorIndex = 0, imageIndex = 0;

    const tube = (geo, x, y, z = 0) => {
      const m = new THREE.Mesh(geo, lineMaterial);
      m.position.set(x, y, z);
      return m;
    };

    const SLOTS = [];
    for (let d = 0; d < depthCells; d++) {
      const z = -(d + 0.5) * cellDepth;
      for (let i = 0; i < cols; i++) {
        const x = -hw + i * colW + colW / 2;
        SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, -hh, z), rot: new THREE.Euler(-Math.PI / 2, 0, 0), d, track: 'floor' + d });
        SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, hh, z), rot: new THREE.Euler(Math.PI / 2, 0, 0), d, track: 'ceil' + d });
      }
      for (let i = 0; i < rows; i++) {
        const y = -hh + i * rowH + rowH / 2;
        SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(-hw, y, z), rot: new THREE.Euler(0, Math.PI / 2, 0), d, track: 'wallL' + d });
        SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(hw, y, z), rot: new THREE.Euler(0, -Math.PI / 2, 0), d, track: 'wallR' + d });
      }
    }

    function populate(group) {
      const baseRow = populateIndex;
      populateIndex += depthCells;
      const slabs = group.userData.slabs;
      const lastWasImage = {};

      for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const slot = SLOTS[i];
        const takesSlabs = (baseRow + slot.d) % 2 === 0;
        if (!takesSlabs || Math.random() > fillChance) {
          slab.visible = false;
          lastWasImage[slot.track] = false;
          continue;
        }
        slab.visible = true;
        const prevWasImage = !!lastWasImage[slot.track];
        // High probability of displaying actual delicious food images on all 4 walls (left, right, top, bottom)
        const wantsImage = !prevWasImage && imageMats.length > 0 && Math.random() > 0.18;
        if (wantsImage) {
          slab.material = imageMats[imageIndex % imageMats.length];
          imageIndex++;
          lastWasImage[slot.track] = true;
        } else {
          slab.material = colorMats[colorIndex % colorMats.length];
          colorIndex++;
          lastWasImage[slot.track] = false;
        }
      }
    }

    function createSegment(z) {
      const group = new THREE.Group();
      group.position.z = z;
      for (let d = 0; d < depthCells; d++) {
        const zz = -d * cellDepth;
        group.add(tube(geoTubeX, -hw, -hh, zz));
        group.add(tube(geoTubeX, -hw, hh, zz));
        group.add(tube(geoTubeY, -hw, -hh, zz));
        group.add(tube(geoTubeY, hw, -hh, zz));
      }
      const slabs = SLOTS.map(slot => {
        const m = new THREE.Mesh(slot.geo, colorMats[0]);
        m.position.copy(slot.pos);
        m.rotation.copy(slot.rot);
        m.visible = false;
        group.add(m);
        return m;
      });
      group.userData.slabs = slabs;
      populate(group);
      return group;
    }

    const rails = new THREE.Group();
    for (let i = 0; i <= cols; i++) {
      const x = -hw + i * colW;
      rails.add(tube(geoTubeZ, x, -hh));
      rails.add(tube(geoTubeZ, x, hh));
    }
    for (let i = 1; i < rows; i++) {
      const y = -hh + i * rowH;
      rails.add(tube(geoTubeZ, -hw, y));
      rails.add(tube(geoTubeZ, hw, y));
    }
    scene.add(rails);

    const segments = [];
    for (let i = 0; i < segCount; i++) {
      const g = createSegment(-i * segDepth);
      scene.add(g);
      segments.push(g);
    }

    function resize() {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      const aspect = w / h;
      camera.aspect = aspect;
      if (aspect < 1) {
        // Mobile portrait: dynamically adjust FOV so left, right, top, and bottom walls are all clearly visible
        const targetHFovRad = 0.46;
        const requiredVFovRad = 2 * Math.atan(targetHFovRad / aspect);
        camera.fov = Math.min(78, Math.max(52, requiredVFovRad * (180 / Math.PI)));
      } else {
        camera.fov = 45;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(host);
    resize();

    // Subtle parallax tilt on desktop
    let targetTiltX = 0, targetTiltY = 0;
    let currentTiltX = 0, currentTiltY = 0;
    if (!isMobile) {
      host.addEventListener('pointermove', (e) => {
        const rect = host.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltY = -nx * 0.045;
        targetTiltX = -ny * 0.03;
      }, { passive: true });
      host.addEventListener('pointerleave', () => {
        targetTiltX = 0;
        targetTiltY = 0;
      }, { passive: true });
    }

    let raf = 0, last = 0;

    // Viewport Culling: Stop WebGL loop completely when user scrolls away from Hero!
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          isHeroVisible = e.isIntersecting;
          if (isHeroVisible && !raf) {
            last = performance.now();
            raf = requestAnimationFrame(animate);
          }
        });
      }, { threshold: 0.05 });
      io.observe(host);
    }

    function animate(now) {
      if (!alive || !isHeroVisible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      // Delta-time based frame-rate independent smooth gliding
      camera.position.z -= SPEED_Z * dt;
      rails.position.z = camera.position.z;

      // Subtle smooth parallax tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;
      camera.rotation.x = currentTiltX;
      camera.rotation.y = currentTiltY;

      const span = segCount * segDepth;
      const z = camera.position.z;
      for (const seg of segments) {
        if (seg.position.z > z + segDepth) {
          let min = 0;
          for (const s of segments) min = Math.min(min, s.position.z);
          seg.position.z = min - segDepth;
          populate(seg);
        } else if (seg.position.z < z - span - segDepth) {
          let max = -999999;
          for (const s of segments) max = Math.max(max, s.position.z);
          seg.position.z = max + segDepth;
          populate(seg);
        }
      }

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(animate);

    window.addEventListener('beforeunload', () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTunnel);
  } else {
    initTunnel();
  }
})();


// ---------- 3. Smoky Text Heading Animation (About Section) ----------
(function () {
  const heading = document.getElementById('smoky-heading');
  if (!heading) return;

  const color = 'var(--gold-300)';
  const intensity = 7;
  const duration = 0.85;
  const stagger = 0.04;

  function buildKF(color, intensity) {
    const n = (Math.max(1, Math.min(20, intensity)) - 1) / 19;
    const r = v => +v.toFixed(2);
    const peakB = Math.round(4 + n * 80);
    const initB = Math.round(2 + n * 30);
    const layers = 1 + Math.round(n * 2);
    const stack = blur => Array.from({ length: layers }, (_, i) =>
      `0 0 ${Math.round((blur * (i + 1)) / layers)}px ${color}`
    ).join(',');
    const peak = stack(peakB);
    const init = stack(initB);
    const d = 0.5 + n * 0.5;
    return `
@keyframes smt-ap-bl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-6 * d)}rem,${r(3 * d)}rem,0) scale(0.85)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes smt-ap-bl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-8 * d)}rem,${r(3 * d)}rem,0) scale(0.8)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
`;
  }

  const styleEl = document.createElement('style');
  styleEl.textContent = buildKF(color, intensity);
  document.head.appendChild(styleEl);

  let animated = false;

  function initSmokyWords() {
    const raw = heading.textContent || '';
    if (!raw.trim()) return;
    heading.textContent = '';
    heading.style.color = 'transparent';

    const segments = raw.match(/\S+|\s+/g) || [];
    const wordSpans = [];
    segments.forEach(seg => {
      if (/^\s+$/.test(seg)) {
        heading.appendChild(document.createTextNode(seg));
      } else {
        const span = document.createElement('span');
        span.className = 'smoky-word';
        span.textContent = seg;
        span.style.textShadow = '0 0 0 ' + color;
        span.style.opacity = '0';
        heading.appendChild(span);
        wordSpans.push(span);
      }
    });

    function playAnimation() {
      wordSpans.forEach((span, i) => {
        const even = i % 2 === 0;
        const anim = even ? 'smt-ap-bl-a' : 'smt-ap-bl-b';
        const delay = i * stagger;
        span.style.animation = anim + ' ' + duration + 's ' + delay + 's cubic-bezier(0,0,0.58,1) both';
      });
    }

    if (animated) {
      playAnimation();
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animated = true;
            playAnimation();
            obs.disconnect();
          }
        });
      }, { rootMargin: '100px 0px', threshold: 0.05 });
      io.observe(heading);
    } else {
      animated = true;
      playAnimation();
    }
  }

  initSmokyWords();

  window.addEventListener('mahdiar:langchange', () => {
    setTimeout(initSmokyWords, 50);
  });
})();


// ---------- 4. Scroll Reveal Observer ----------
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
  });
}, { threshold: 0.10 });
document.querySelectorAll('.reveal').forEach(el => ioReveal.observe(el));


// ---------- 5. Ultra-Optimized Kinetic Grid Mesh (شبکه متحرک طلایی پس‌زمینه) ----------
(function () {
  function createKineticGrid(canvas, opts) {
    const host = canvas.parentElement;
    if (!host) return () => { };
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => { };

    const isMobile = window.innerWidth <= 768;
    const cfg = Object.assign({
      dotColor: '#e8c988',
      lineColor: '#c99a45',
      trailColor: '#6fa89c',
      spacing: isMobile ? 65 : 46,
      radius: isMobile ? 180 : 220,
      strength: 3.5,
      trail: true
    }, opts || {});

    const GAP = Math.max(12, cfg.spacing);
    const R = Math.max(1, cfg.radius);
    const PULL = (Math.max(1, Math.min(10, cfg.strength)) / 10) * 3.5;

    let alive = true;
    let isVisible = false;
    let W = 1, H = 1, cols = [], dots = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let trailPts = [];
    let raf = 0;

    function build(mw, mh) {
      const r = host.getBoundingClientRect();
      W = Math.max(1, Math.floor(mw != null ? mw : r.width));
      H = Math.max(1, Math.floor(mh != null ? mh : r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = []; dots = [];
      const nCols = Math.floor(W / GAP) + 2;
      const nRows = Math.floor(H / GAP) + 2;
      for (let c = 0; c < nCols; c++) {
        const col = [];
        for (let rIdx = 0; rIdx < nRows; rIdx++) {
          const hx = c * GAP, hy = rIdx * GAP;
          const d = { hx, hy, x: hx, y: hy, vx: 0, vy: 0 };
          col.push(d);
          dots.push(d);
        }
        cols.push(col);
      }
      renderStatic();
    }
    build();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(entries => {
      const cr = entries[0] && entries[0].contentRect;
      build(cr && cr.width, cr && cr.height);
    }) : null;
    if (ro) ro.observe(host);

    function setMouse(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      mouse.x = clientX - r.left;
      mouse.y = clientY - r.top;
      mouse.active = true;
      if (cfg.trail) {
        trailPts.push({ x: mouse.x, y: mouse.y, t: performance.now() });
        if (trailPts.length > 35) trailPts.shift();
      }
      if (!raf && isVisible) {
        raf = requestAnimationFrame(frame);
      }
    }

    function onMove(e) { setMouse(e.clientX, e.clientY); }
    function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }
    function onTouch(e) { const t = e.touches && e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }

    host.addEventListener('mousemove', onMove, { passive: true });
    host.addEventListener('mouseleave', onLeave, { passive: true });
    host.addEventListener('touchmove', onTouch, { passive: true });
    host.addEventListener('touchend', onLeave, { passive: true });

    // Static instant draw — 0 CPU cost when idle
    function renderStatic() {
      ctx.clearRect(0, 0, W, H);
      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          const right = cols[c + 1] && cols[c + 1][rIdx];
          const down = cols[c][rIdx + 1];
          if (right) {
            ctx.globalAlpha = 0.07;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }
          if (down) {
            ctx.globalAlpha = 0.07;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(down.x, down.y);
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = cfg.dotColor;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.8, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!alive || !isVisible) { raf = 0; return; }
      ctx.clearRect(0, 0, W, H);

      let totalMovement = 0;
      for (const d of dots) {
        let ax = (d.hx - d.x) * 0.08;
        let ay = (d.hy - d.y) * 0.08;
        if (mouse.active) {
          const dx = mouse.x - d.x, dy = mouse.y - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < R && dist > 0.001) {
            const f = (1 - dist / R) * PULL;
            ax += (dx / dist) * f;
            ay += (dy / dist) * f;
          }
        }
        d.vx = (d.vx + ax) * 0.82;
        d.vy = (d.vy + ay) * 0.82;
        d.x += d.vx;
        d.y += d.vy;
        totalMovement += Math.abs(d.vx) + Math.abs(d.vy);
      }

      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          const right = cols[c + 1] && cols[c + 1][rIdx];
          const down = cols[c][rIdx + 1];
          const prox = mouse.active ? Math.max(0, 1 - Math.sqrt((mouse.x - d.x) ** 2 + (mouse.y - d.y) ** 2) / R) : 0;
          if (right) {
            ctx.globalAlpha = 0.06 + prox * 0.65;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5 + prox * 1.2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }
          if (down) {
            ctx.globalAlpha = 0.06 + prox * 0.65;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5 + prox * 1.2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(down.x, down.y);
            ctx.stroke();
          }
        }
      }

      for (const d of dots) {
        const prox = mouse.active ? Math.max(0, 1 - Math.sqrt((mouse.x - d.x) ** 2 + (mouse.y - d.y) ** 2) / R) : 0;
        ctx.globalAlpha = 0.22 + prox * 0.75;
        ctx.fillStyle = cfg.dotColor;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.8 + prox * 1.8, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (cfg.trail && trailPts.length > 1) {
        const now = performance.now();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < trailPts.length; i++) {
          const a = trailPts[i - 1], b = trailPts[i];
          const age = now - b.t;
          if (age > 260) continue;
          ctx.globalAlpha = Math.max(0, 1 - age / 260) * 0.85;
          ctx.strokeStyle = cfg.trailColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // Smart Idle Sleep: If physics settled and mouse/touch inactive, sleep loop to save 100% CPU!
      if (!mouse.active && totalMovement < 0.05 && trailPts.length === 0) {
        raf = 0;
        renderStatic();
      } else {
        raf = requestAnimationFrame(frame);
      }
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          isVisible = e.isIntersecting;
          if (isVisible && (mouse.active || !raf)) {
            raf = requestAnimationFrame(frame);
          }
        });
      }, { threshold: 0.05 });
      io.observe(host);
    } else {
      isVisible = true;
      renderStatic();
    }

    return function destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }

  const isMobile = window.innerWidth <= 768;
  const sections = [
    { id: 'kinetic-hero', opts: { spacing: isMobile ? 65 : 44 } },
    { id: 'kinetic-about', opts: { spacing: isMobile ? 65 : 46 } },
    { id: 'kinetic-menu', opts: { spacing: isMobile ? 65 : 46 } },
    { id: 'kinetic-gallery', opts: { spacing: isMobile ? 65 : 46, dotColor: '#f2e6cb', lineColor: '#6fa89c', trailColor: '#e8c988' } },
    { id: 'kinetic-contact', opts: { spacing: isMobile ? 65 : 46 } },
    { id: 'kinetic-footer', opts: { spacing: isMobile ? 60 : 40 } }
  ];

  sections.forEach(({ id, opts }) => {
    const canvas = document.getElementById(id);
    if (canvas) createKineticGrid(canvas, opts);
  });
})();
