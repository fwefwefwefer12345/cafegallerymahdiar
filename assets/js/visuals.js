// Cafe Mahdiar - 3D Visuals, Canvases & Animations (Mobile-First & Optimized)

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

// round carousel — gallery (Smooth & Controlled Mobile Touch Drag)
(function () {
  const images = galleryImages;
  const count = images.length;
  if (!count) return;

  const imageWidth = 300, imageHeight = 300;
  const spacing = 3, speed = 2, direction = 'right', drag = true;
  const sensitivity = 1.2, tilt = -7, perspective = 3000;
  const cornerRadius = 22, innerDim = 3.5;

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const degPerSec = speed * 6 * (direction === 'left' ? -1 : 1);

  const wrap = document.getElementById('round-carousel');
  if (!wrap) return;
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
        vel *= 0.88; // Gentle braking friction
      } else {
        vel = 0;
        rotY += degPerSec * dt;
      }
    }
    apply();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // Viewport Culling Observer
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

  if (drag) {
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

      const k = 0.18; // Smooth, 1:1 natural feel per pixel
      rotY += dx * k;

      // Calculate smooth velocity with a strict safety cap (max 80 deg/sec)
      const instantVel = (stepDx * k) / dt;
      vel = Math.max(-80, Math.min(80, instantVel * 0.7));
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
  }
})();

// gallery tunnel — hero background (ported from the Originkit tunnel component)
(function () {
  function initTunnel() {
    const host = document.querySelector('.hero');
    const canvas = document.getElementById('kinetic-grid');
    if (!host || !canvas) return;
    if (typeof THREE === 'undefined') {
      setTimeout(initTunnel, 50);
      return;
    }

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
    const PALETTE = ['#43a047', '#1e88e5', '#e53935', '#8e24aa'];
    const BACKGROUND = '#1c130d';
    const LINE_COLOR = '#c99a45';
    const LINE_OPACITY = 28;
    const GRID = 4;
    const CELL_MODE = 'stretched';
    const TUNNEL_SIZE_UI = 9;
    const SPEED = 260;
    const FADE = 100;

    const TUNNEL_WIDTH = 2, TUNNEL_HEIGHT = 1.8;
    const BASE_SEGMENT_DEPTH = 1, TUNNEL_LENGTH = 15;
    const LINE_RADIUS = 0.003;
    const SCROLL_TO_Z = 0.05, CAMERA_CHASE = 0.1, FADE_IN = 1;
    const fogFarFor = (segCount, segDepth) => segCount * segDepth * 0.95;

    let alive = true;

    const sizeK = 1 + ((TUNNEL_SIZE_UI - 1) * 2) / 19;
    const rows = Math.max(1, Math.round(GRID));
    let cols, colW, rowH, cellDepth, depthCells, segDepth, tunnelW, tunnelH;

    if (CELL_MODE === 'square') {
      const cell = (TUNNEL_HEIGHT * sizeK) / rows;
      cols = Math.max(1, Math.round((TUNNEL_WIDTH * sizeK) / cell));
      depthCells = Math.max(1, Math.round(BASE_SEGMENT_DEPTH / cell));
      cellDepth = cell; segDepth = depthCells * cell;
      tunnelH = cell * rows; tunnelW = cell * cols;
      colW = cell; rowH = cell;
    } else {
      cols = rows; depthCells = 1; segDepth = BASE_SEGMENT_DEPTH; cellDepth = BASE_SEGMENT_DEPTH;
      tunnelW = TUNNEL_WIDTH * sizeK; tunnelH = TUNNEL_HEIGHT * sizeK;
      colW = tunnelW / cols; rowH = tunnelH / rows;
    }

    const segCount = Math.max(6, Math.round(TUNNEL_LENGTH / segDepth));
    const perimeterCells = 2 * cols + 2 * rows;
    const countMatched = Math.min(0.5, (2 * rows * cellDepth) / perimeterCells);
    const fillChance = CELL_MODE === 'square' ? (countMatched + 0.5) / 2 : 0.5;
    const fogFar = fogFarFor(segCount, segDepth);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND);
    const fogNear = Math.min(fogFar * (1 - Math.min(100, Math.max(0, FADE)) / 100), fogFar - 0.01);
    scene.fog = new THREE.Fog(new THREE.Color(BACKGROUND), fogNear, fogFar);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(LINE_COLOR), transparent: true,
      opacity: Math.max(0, Math.min(100, LINE_OPACITY)) / 100
    });

    const hw = tunnelW / 2, hh = tunnelH / 2;

    const geoFloor = new THREE.PlaneGeometry(colW, cellDepth);
    const geoWall = new THREE.PlaneGeometry(cellDepth, rowH);

    const railLength = segCount * segDepth + segDepth;
    const geoTubeZ = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -railLength)), 1, LINE_RADIUS, 8);
    const geoTubeX = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(tunnelW, 0, 0)), 1, LINE_RADIUS, 8);
    const geoTubeY = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, tunnelH, 0)), 1, LINE_RADIUS, 8);

    const colorMats = PALETTE.map(hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), side: THREE.DoubleSide }));

    const fading = [];
    const imageMats = SLIDES.map(({ url, y }) => {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
      loader.load(url, (tex) => {
        if (!alive) { tex.dispose(); return; }
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        else tex.encoding = THREE.sRGBEncoding;
        const iw = tex.image?.width || 1, ih = tex.image?.height || 1;
        const aspect = iw / ih;
        if (aspect > 1) {
          tex.repeat.set(1 / aspect, 1);
          tex.offset.set((1 - 1 / aspect) / 2, 0);
        } else {
          const rY = aspect;
          const anchor = Math.max(0, Math.min(100, y)) / 100;
          tex.repeat.set(1, rY);
          tex.offset.set(0, (1 - rY) * (1 - anchor));
        }
        mat.map = tex; mat.needsUpdate = true; fading.push(mat);
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
      // tracks the last-assigned material per wall/floor row, so two image
      // slabs are never placed side by side along the same strip.
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
        const wantsImage = !prevWasImage && imageMats.length > 0 && Math.random() > 0.5;
        if (wantsImage) {
          slab.material = imageMats[(3 * imageIndex) % imageMats.length];
          imageIndex++;
          lastWasImage[slot.track] = true;
        } else {
          slab.material = colorMats[(5 * colorIndex) % colorMats.length];
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
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(host);
    resize();

    let scrollPos = 0, raf = 0, last = 0, inView = true;
    const speedFactor = SPEED / 100;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          inView = e.isIntersecting;
          if (inView && !raf) {
            last = performance.now();
            raf = requestAnimationFrame(animate);
          }
        });
      }, { threshold: 0.05 });
      io.observe(host);
    }

    function animate(now) {
      if (!alive || !inView) { raf = 0; return; }
      raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      scrollPos += speedFactor;
      const want = -SCROLL_TO_Z * scrollPos;
      camera.position.z += CAMERA_CHASE * (want - camera.position.z);
      rails.position.z = camera.position.z;

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

      for (let i = fading.length - 1; i >= 0; i--) {
        const m = fading[i];
        m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
        if (m.opacity >= 1) fading.splice(i, 1);
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



// smoky text — about heading (Fast & Responsive)
(function () {
  const heading = document.getElementById('smoky-heading');
  if (!heading) return;

  const color = 'var(--gold-300)';
  const intensity = 8;
  const position = 'bottomLeft';
  const duration = 0.85; // seconds (snappy & clear)
  const stagger = 0.05;  // seconds between words

  function buildKF(color, intensity) {
    const n = (Math.max(1, Math.min(20, intensity)) - 1) / 19;
    const r = v => +v.toFixed(2);
    const peakB = Math.round(4 + n * 120);
    const initB = Math.round(2 + n * 40);
    const layers = 1 + Math.round(n * 2);
    const stack = blur => Array.from({ length: layers }, (_, i) =>
      `0 0 ${Math.round((blur * (i + 1)) / layers)}px ${color}`
    ).join(',');
    const peak = stack(peakB);
    const init = stack(initB);
    const d = 0.5 + n * 0.5;
    return `
@keyframes smt-ap-bl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-8 * d)}rem,${r(4 * d)}rem,0) rotate(20deg) skewX(-35deg) scale(0.85)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes smt-ap-bl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-10 * d)}rem,${r(4 * d)}rem,0) rotate(20deg) skewX(35deg) scale(0.75)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes smt-ap-tl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-8 * d)}rem,${r(-4 * d)}rem,0) rotate(-20deg) skewX(35deg) scale(0.85)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes smt-ap-tl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-10 * d)}rem,${r(-4 * d)}rem,0) rotate(-20deg) skewX(-35deg) scale(0.75)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
`;
  }

  const styleEl = document.createElement('style');
  styleEl.textContent = buildKF(color, intensity);
  document.head.appendChild(styleEl);

  let animated = false;

  function initSmokyWords() {
    const raw = heading.textContent || '';
    if(!raw.trim()) return;
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
        const anim = position === 'topLeft'
          ? (even ? 'smt-ap-tl-a' : 'smt-ap-tl-b')
          : (even ? 'smt-ap-bl-a' : 'smt-ap-bl-b');
        const delay = i * stagger;
        span.style.animation = anim + ' ' + duration + 's ' + delay + 's cubic-bezier(0,0,0.58,1) both';
      });
    }

    if(animated){
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
      }, { rootMargin: '120px 0px', threshold: 0.05 });
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

// ASCII Reveal — ported from Originkit AsciiImage component, applied to the About photo
(function(){
  function startAscii(){
    const canvas = document.getElementById('about-ascii-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    const ABOUT_IMAGE_SRC = "assets/images/about.webp";

    const opts = {
      fit: 'cover',
      focusY: 19,
      columns: window.innerWidth <= 768 ? 120 : 180,
      ramp: ' .:-=+*#%@',
      invert: false,
      contrast: 100,
      colorMode: 'mono',
      reveal: true,
      revealSize: window.innerWidth <= 768 ? 95 : 80,
      revealSoftness: 16
    };
    const inkColor = '#e8c988';

    const contrastAt = v => 0.5 + (v / 100) * 2;
    const clampFocus = v => Math.min(100, Math.max(0, typeof v === 'number' ? v : 50));

    function placeRect(imgW, imgH, boxW, boxH, fit, focusY){
      const scale = fit === 'contain'
        ? Math.min(boxW / imgW, boxH / imgH)
        : Math.max(boxW / imgW, boxH / imgH);
      const dw = imgW * scale, dh = imgH * scale;
      const f = fit === 'cover' ? clampFocus(focusY) / 100 : 0.5;
      return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
    }

    const offCanvas = document.createElement('canvas');
    const samplerCanvas = document.createElement('canvas');
    const revealCanvas = document.createElement('canvas');
    const maskCanvas = document.createElement('canvas');
    let imgEl = null;
    let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };
    let raf = 0;
    let alive = true;
    let inView = true;
    const BLOB_COUNT = 5;
    const blobs = Array.from({ length: BLOB_COUNT }, () => ({ x: 0, y: 0 }));
    let seeded = false;
    const pointer = { x: -9999, y: -9999, inside: false };

    function getSize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 320;
      const h = canvas.clientHeight || 320;
      return { w, h, dpr };
    }

    function buildAscii(){
      if(!imgEl) return;
      const { w, h, dpr } = getSize();
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));

      const cols = Math.max(8, Math.round(opts.columns));
      const cellW = (w * dpr) / cols;
      const fontPx = cellW * 1.7;
      const cellH = fontPx;
      const rows = Math.max(1, Math.floor((h * dpr) / cellH));

      samplerCanvas.width = cols;
      samplerCanvas.height = rows;
      const sctx = samplerCanvas.getContext('2d', { willReadFrequently: true });
      if(!sctx) return;

      const place = placeRect(imgEl.width, imgEl.height, canvas.width, canvas.height, opts.fit, opts.focusY);
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(imgEl, place.dx / cellW, place.dy / cellH, place.dw / cellW, place.dh / cellH);

      let data;
      try {
        data = sctx.getImageData(0, 0, cols, rows).data;
      } catch(e){
        console.warn('ASCII getImageData error:', e);
        return;
      }

      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const octx = offCanvas.getContext('2d');
      if(!octx) return;
      octx.clearRect(0, 0, offCanvas.width, offCanvas.height);
      octx.font = fontPx.toFixed(2) + 'px ui-monospace, monospace';
      octx.textBaseline = 'top';

      const chars = opts.ramp;
      const punch = contrastAt(opts.contrast);
      const last = chars.length - 1;
      for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
          const i = (r * cols + c) * 4;
          const rr = data[i], gg = data[i + 1], bb = data[i + 2];
          let lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
          lum = (lum - 0.5) * punch + 0.5;
          if(opts.invert) lum = 1 - lum;
          lum = lum < 0 ? 0 : lum > 1 ? 1 : lum;
          const ch = chars[Math.round(lum * last)];
          if(ch === ' ') continue;
          octx.fillStyle = opts.colorMode === 'image'
            ? `rgb(${Math.min(255, rr + 30)}, ${Math.min(255, gg + 30)}, ${Math.min(255, bb + 30)})`
            : inkColor;
          octx.fillText(ch, c * cellW, r * cellH);
        }
      }
      coverRect = place;
    }

    function ensureLayer(layer){
      if(layer.width !== canvas.width || layer.height !== canvas.height){
        layer.width = canvas.width;
        layer.height = canvas.height;
      }
      return layer;
    }

    function updateBlobs(){
      if(blobs.length === 0) return;
      const { dpr } = getSize();
      const tx = pointer.x * dpr, ty = pointer.y * dpr;
      if(!seeded){
        for(const b of blobs){ b.x = tx; b.y = ty; }
        seeded = true;
        return;
      }
      blobs[0].x += (tx - blobs[0].x) * 0.35;
      blobs[0].y += (ty - blobs[0].y) * 0.35;
      for(let i = 1; i < blobs.length; i++){
        blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
        blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
      }
    }

    function paint(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offCanvas, 0, 0);
      if(!opts.reveal || !pointer.inside || !imgEl) return;

      const { dpr } = getSize();
      const photo = ensureLayer(revealCanvas);
      const pctx = photo.getContext('2d');
      const mask = ensureLayer(maskCanvas);
      const mctx = mask.getContext('2d');
      if(!pctx || !mctx) return;

      pctx.globalCompositeOperation = 'source-over';
      pctx.clearRect(0, 0, photo.width, photo.height);
      pctx.drawImage(imgEl, coverRect.dx, coverRect.dy, coverRect.dw, coverRect.dh);

      mctx.clearRect(0, 0, mask.width, mask.height);
      mctx.save();
      mctx.filter = `blur(${(opts.revealSoftness * dpr).toFixed(1)}px)`;
      mctx.fillStyle = '#FFFFFF';
      for(let i = 0; i < blobs.length; i++){
        const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
        const radius = opts.revealSize * dpr * (1 - t * 0.5);
        mctx.beginPath();
        mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
        mctx.fill();
      }
      mctx.restore();

      pctx.globalCompositeOperation = 'destination-in';
      pctx.drawImage(mask, 0, 0);
      pctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(photo, 0, 0);
    }

    function loop(){
      if(!alive || !inView){
        raf = 0;
        return;
      }
      updateBlobs();
      paint();
      raf = requestAnimationFrame(loop);
    }

    function onMove(clientX, clientY){
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      pointer.x = x; pointer.y = y;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if(pointer.inside && inView && !raf){
        raf = requestAnimationFrame(loop);
      }
      const frame = canvas.closest('.about-frame');
      if(frame) frame.classList.add('touched');
    }

    function onLeave(){
      pointer.inside = false;
      seeded = false;
    }

    const img = new Image();
    img.onload = function(){
      if(!alive) return;
      imgEl = img;
      buildAscii();
      paint();
      if(opts.reveal && inView && !raf) raf = requestAnimationFrame(loop);
    };
    img.src = ABOUT_IMAGE_SRC;
    if(img.complete && img.naturalWidth > 0){
      imgEl = img;
      buildAscii();
      paint();
      if(opts.reveal && inView && !raf) raf = requestAnimationFrame(loop);
    }

    if('IntersectionObserver' in window){
      const aboutSec = document.getElementById('about');
      if(aboutSec){
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            inView = e.isIntersecting;
            if(inView){
              buildAscii();
              paint();
              if(opts.reveal && !raf) raf = requestAnimationFrame(loop);
            }
          });
        }, { threshold: 0.05 });
        io.observe(aboutSec);
      }
    }

    let ro = null;
    if(typeof ResizeObserver !== 'undefined'){
      ro = new ResizeObserver(() => {
        opts.columns = window.innerWidth <= 768 ? 120 : 180;
        buildAscii();
        paint();
      });
      ro.observe(canvas);
    }

    canvas.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY));
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('touchstart', (e) => {
      if(e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if(e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', onLeave);

    window.addEventListener('beforeunload', () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro && ro.disconnect();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startAscii);
  } else {
    startAscii();
  }
})();


// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));



// glitter wrap — starfield sparkle overlay, applied across every section
// (ported from the Originkit GlitterWrap component)
(function () {
  function parseColor(input) {
    if (!input) return [255, 255, 255, 1];
    const s = input.trim();
    if (s.startsWith('#')) {
      let hex = s.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
    }
    const m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const parts = m[1].split(',').map(p => parseFloat(p.trim()));
      return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] == null ? 1 : parts[3]];
    }
    return [255, 255, 255, 1];
  }

  function createGlitterWrap(canvas, opts) {
    const container = canvas.parentElement;
    if (!container) return () => { };
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => { };

    const cfgSrc = Object.assign({
      particleCount: 220,
      color1: '#e8c988',
      color2: '#f2e6cb',
      color3: '#6fa89c',
      speed: 3,
      density: 60,
      starSize: 8,
      focalDepth: 8,
      turbulence: 2,
      brightness: 55,
      glitterIntensity: 4,
      trailAmount: 55,
      reverse: false
    }, opts || {});

    const palette = [parseColor(cfgSrc.color1), parseColor(cfgSrc.color2), parseColor(cfgSrc.color3)];
    const rgbStrs = palette.map(p => `rgb(${p[0]}, ${p[1]}, ${p[2]})`);

    const cfg = {
      reverse: cfgSrc.reverse,
      density: cfgSrc.density,
      stepZ: cfgSrc.speed * 0.0008,
      focalDepth: cfgSrc.focalDepth / 100,
      starScale: cfgSrc.starSize * 0.15,
      turbulence: cfgSrc.turbulence * 0.2,
      glitter: cfgSrc.glitterIntensity * 0.1,
      brightness: Math.min(1, cfgSrc.brightness / 100),
      trail: cfgSrc.trailAmount / 100
    };

    let alive = true;
    const stars = [];
    let elapsed = 0;
    let lastT = performance.now();
    const size = { w: 0, h: 0, dpr: 1 };

    function resetStar(s, initial) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (0.2 + Math.random() * 0.8) * (cfg.density / 15);
      s.x = Math.cos(angle) * radius;
      s.y = Math.sin(angle) * radius;
      if (cfg.reverse) {
        s.z = initial ? cfg.focalDepth + Math.random() * (1 - cfg.focalDepth) : cfg.focalDepth;
      } else {
        s.z = initial ? Math.random() : 1.0;
      }
      s.px = NaN; s.py = NaN;
      s.seed = Math.random() * 1000;
      s.vmul = 0.6 + Math.random() * 0.8;
      s.colorIdx = Math.floor(Math.random() * 3);
      s.flashUntil = 0;
      s.nextFlash = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, cfg.glitter));
    }
    function makeStar() {
      return { x: 0, y: 0, z: 0, px: NaN, py: NaN, seed: 0, vmul: 1, colorIdx: 0, flashUntil: 0, nextFlash: 0 };
    }
    function syncCount() {
      const count = Math.max(1, Math.floor(cfgSrc.particleCount));
      if (stars.length === count) return;
      if (stars.length > count) { stars.length = count; }
      else { while (stars.length < count) { const s = makeStar(); resetStar(s, true); stars.push(s); } }
    }

    function resize(entry) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cr = entry && entry.contentRect;
      const rectW = (cr && cr.width) || container.clientWidth || container.getBoundingClientRect().width;
      const rectH = (cr && cr.height) || container.clientHeight || container.getBoundingClientRect().height;
      const w = Math.max(1, Math.floor(rectW) || 600);
      const h = Math.max(1, Math.floor(rectH) || 400);
      if (size.w === w && size.h === h && size.dpr === dpr) return;
      size.w = w; size.h = h; size.dpr = dpr;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    }

    syncCount();
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(entries => resize(entries[0])) : null;
    if (ro) ro.observe(container);
    function forceResize() { size.w = -1; size.h = -1; resize(); }

    function drawFrame(deltaSec) {
      syncCount();
      const { w, h } = size;
      const cx = w / 2, cy = h / 2;
      const projScale = Math.min(w, h) * 0.9;
      const dt = Math.max(0.001, Math.min(0.1, deltaSec)) * 60;

      const keep = Math.pow(Math.min(0.98, Math.max(0, cfg.trail)), dt);
      const trailAlpha = Math.max(0.02, 1 - keep);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const vz = cfg.stepZ * s.vmul * dt;
        if (cfg.reverse) {
          s.z += vz;
          if (s.z >= 1.0) { resetStar(s); continue; }
        } else {
          s.z -= vz;
          if (s.z <= cfg.focalDepth) { resetStar(s); continue; }
        }

        let tx = s.x, ty = s.y;
        if (cfg.turbulence > 0) {
          const t = elapsed * 1.2 + s.seed;
          const amp = cfg.turbulence * (1 - s.z) * 0.25;
          tx += Math.sin(t + s.seed) * amp;
          ty += Math.cos(t * 1.13 + s.seed * 0.7) * amp;
        }

        const persp = cfg.focalDepth / Math.max(s.z, 0.0001);
        const sx = cx + tx * persp * projScale;
        const sy = cy + ty * persp * projScale;

        if (!cfg.reverse && (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20)) {
          resetStar(s); continue;
        }

        let flashMult = 1;
        if (cfg.glitter > 0) {
          if (elapsed >= s.nextFlash && s.flashUntil < elapsed) {
            s.flashUntil = elapsed + 0.04 + Math.random() * 0.07;
            s.nextFlash = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, cfg.glitter));
          }
          if (elapsed <= s.flashUntil) flashMult = 1 + 2.5 * cfg.glitter;
        }

        const sizePersp = Math.min(2.5, (cfg.focalDepth / Math.max(s.z, 0.0001)) * 0.6);
        const baseR = Math.max(0.25, cfg.starScale * (0.4 + sizePersp));
        const maxR = 1 + cfg.starScale * 2.5;
        const r = Math.min(baseR * flashMult, maxR);

        const lifeT = cfg.reverse ? s.z : 1 - s.z;
        const fadeIn = cfg.reverse ? Math.min(1, (s.z - cfg.focalDepth) / (1 - cfg.focalDepth) / 0.12) : 1;
        const a = Math.min(1, cfg.reverse ? 0.85 - lifeT * 0.6 : lifeT * 0.9 + 0.05) * fadeIn * cfg.brightness * (flashMult > 1 ? 1 : 0.85);

        const colStr = rgbStrs[s.colorIdx];

        if (!Number.isNaN(s.px) && !Number.isNaN(s.py)) {
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = colStr;
          ctx.lineWidth = Math.max(0.4, r * 0.4);
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }

        ctx.globalAlpha = a;
        ctx.fillStyle = colStr;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);

        if (flashMult > 1) {
          const rf = Math.min(r * 1.4, maxR * 1.4);
          ctx.globalAlpha = a * 0.5;
          ctx.fillRect(sx - rf, sy - rf, rf * 2, rf * 2);
        }

        s.px = sx; s.py = sy;
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      elapsed += Math.min(0.1, Math.max(0, deltaSec));
    }

    let raf = 0;
    function loop(t) {
      if (!alive) return;
      const deltaSec = (t - lastT) / 1000;
      lastT = t;
      drawFrame(deltaSec);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const controller = function destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
    controller.forceResize = forceResize;
    return controller;
  }

  const sections = [
    { id: 'glitter-hero', opts: { particleCount: 260, speed: 3, starSize: 9, brightness: 60, glitterIntensity: 5, trailAmount: 55, density: 70 } },
    { id: 'glitter-about', opts: { particleCount: 160, speed: 2, starSize: 7, brightness: 40, glitterIntensity: 3, trailAmount: 50, density: 55 } },
    { id: 'glitter-menu', opts: { particleCount: 160, speed: 2, starSize: 7, brightness: 35, glitterIntensity: 3, trailAmount: 50, density: 55 } },
    { id: 'glitter-gallery', opts: { particleCount: 240, speed: 2.5, starSize: 8, brightness: 55, glitterIntensity: 5, trailAmount: 55, density: 65, color1: '#6fa89c', color2: '#e8c988', color3: '#f2e6cb' } },
    { id: 'glitter-contact', opts: { particleCount: 160, speed: 2, starSize: 7, brightness: 35, glitterIntensity: 3, trailAmount: 50, density: 55 } },
    { id: 'glitter-footer', opts: { particleCount: 120, speed: 1.8, starSize: 6, brightness: 30, glitterIntensity: 3, trailAmount: 50, density: 50 } }
  ];

  window.__glitterControllers = [];
  sections.forEach(({ id, opts }) => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const controller = createGlitterWrap(canvas, opts);
      if (controller) window.__glitterControllers.push(controller);
    }
  });
  window.addEventListener('load', () => {
    window.__glitterControllers.forEach(c => c.forceResize && c.forceResize());
  });
})();




// kinetic grid — reactive dot mesh, applied across every section
// (ported from the Originkit Kinetic Grid component)
(function () {
  function createKineticGrid(canvas, opts) {
    const host = canvas.parentElement;
    if (!host) return () => { };
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => { };

    const cfg = Object.assign({
      dotColor: '#e8c988',
      lineColor: '#c99a45',
      trailColor: '#6fa89c',
      spacing: 42,
      radius: 220,
      strength: 4,
      trail: true
    }, opts || {});

    const GAP = Math.max(8, cfg.spacing);
    const R = Math.max(1, cfg.radius);
    const PULL = (Math.max(1, Math.min(10, cfg.strength)) / 10) * 4;

    let alive = true;
    let W = 1, H = 1, cols = [], dots = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let trailPts = [];

    function build(mw, mh) {
      const r = host.getBoundingClientRect();
      W = Math.max(1, Math.floor(mw != null ? mw : r.width));
      H = Math.max(1, Math.floor(mh != null ? mh : r.height));
      const dpr = window.devicePixelRatio || 1;
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
    }
    build();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(entries => {
      const cr = entries[0] && entries[0].contentRect;
      build(cr && cr.width, cr && cr.height);
    }) : null;
    if (ro) ro.observe(host);
    function forceResize() { build(); }

    function setMouse(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      mouse.x = clientX - r.left;
      mouse.y = clientY - r.top;
      mouse.active = true;
      const now = performance.now();
      trailPts.push({ x: mouse.x, y: mouse.y, t: now });
      if (trailPts.length > 80) trailPts.shift();
    }
    function onMove(e) { setMouse(e.clientX, e.clientY); }
    function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }
    function onTouch(e) { const t = e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }

    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseleave', onLeave);
    host.addEventListener('touchmove', onTouch, { passive: true });
    host.addEventListener('touchend', onLeave);

    let raf = 0;
    function frame() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);

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
      }

      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          const right = cols[c + 1] && cols[c + 1][rIdx];
          const down = cols[c][rIdx + 1];
          const prox = mouse.active ? Math.max(0, 1 - Math.sqrt((mouse.x - d.x) ** 2 + (mouse.y - d.y) ** 2) / R) : 0;
          if (right) {
            ctx.globalAlpha = 0.06 + prox * 0.7;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5 + prox * 1.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }
          if (down) {
            ctx.globalAlpha = 0.06 + prox * 0.7;
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = 0.5 + prox * 1.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(down.x, down.y);
            ctx.stroke();
          }
        }
      }

      for (const d of dots) {
        const prox = mouse.active ? Math.max(0, 1 - Math.sqrt((mouse.x - d.x) ** 2 + (mouse.y - d.y) ** 2) / R) : 0;
        ctx.globalAlpha = 0.22 + prox * 0.78;
        ctx.fillStyle = cfg.dotColor;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.8 + prox * 2.2, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (cfg.trail) {
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
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return (function () {
      const controller = function destroy() {
        alive = false;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        host.removeEventListener('mousemove', onMove);
        host.removeEventListener('mouseleave', onLeave);
        host.removeEventListener('touchmove', onTouch);
        host.removeEventListener('touchend', onLeave);
      };
      controller.forceResize = forceResize;
      return controller;
    })();
  }

  const sections = [
    { id: 'kinetic-hero', opts: { spacing: 42, radius: 260, strength: 4 } },
    { id: 'kinetic-about', opts: { spacing: 46, radius: 220, strength: 3 } },
    { id: 'kinetic-menu', opts: { spacing: 46, radius: 220, strength: 3 } },
    { id: 'kinetic-gallery', opts: { spacing: 46, radius: 220, strength: 4, dotColor: '#f2e6cb', lineColor: '#6fa89c', trailColor: '#e8c988' } },
    { id: 'kinetic-contact', opts: { spacing: 46, radius: 220, strength: 3 } },
    { id: 'kinetic-footer', opts: { spacing: 40, radius: 200, strength: 3 } }
  ];

  window.__kineticControllers = [];
  sections.forEach(({ id, opts }) => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const controller = createKineticGrid(canvas, opts);
      if (controller) window.__kineticControllers.push(controller);
    }
  });
  window.addEventListener('load', () => {
    window.__kineticControllers.forEach(c => c.forceResize && c.forceResize());
  });
})();

