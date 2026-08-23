// Cafe Mahdiar - App Logic & Cart Manager

function applyLanguage(lang){
  CURRENT_LANG = lang;
  try { localStorage.setItem('mahdiar-lang', lang); } catch(e){}

  document.documentElement.lang = (lang === 'tr') ? 'tr' : lang;
  document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';

  const dict = I18N[lang] || I18N.fa;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(dict[key] != null) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if(dict[key] != null) el.setAttribute('aria-label', dict[key]);
  });

  const toggleBtn = document.getElementById('lang-toggle');
  if(toggleBtn) toggleBtn.textContent = LANG_LABELS[lang] || lang.toUpperCase();

  if(typeof renderTabs === 'function') renderTabs();
  if(typeof renderGrid === 'function' && typeof activeCategory !== 'undefined') renderGrid(activeCategory);
  window.dispatchEvent(new CustomEvent('mahdiar:langchange', { detail: { lang } }));
}

let tabsEl, gridEl, categories, activeCategory;

function itemName(item){
  if(CURRENT_LANG === 'fa') return item.n;
  return item[CURRENT_LANG] || item.n;
}
function itemDesc(item){
  if(CURRENT_LANG === 'fa') return item.d;
  return item[CURRENT_LANG + '_d'] || item.d;
}
function catLabel(cat){
  const l = CATEGORY_LABELS[cat];
  return (l && l[CURRENT_LANG]) || cat;
}

function renderGrid(cat){
  activeCategory = cat;
  if(!gridEl) gridEl = document.getElementById('menu-grid');
  if(!gridEl) return;
  gridEl.innerHTML = '';
  menuData[cat].forEach(item=>{
    const el = document.createElement('div');
    el.className = 'menu-item';
    const descText = itemDesc(item);
    const descHtml = descText ? `<span class="desc">${descText}</span>` : '';
    const priceStr = item.p ? (typeof item.p === 'string' ? item.p : item.p + 'T') : '—';
    el.innerHTML = `<span><span class="name">${itemName(item)}</span>${descHtml}</span><span class="price">${priceStr}</span><span class="item-qty"></span>`;
    el.dataset.name = item.n;
    gridEl.appendChild(el);
  });
  if(typeof syncCartUI === 'function') syncCartUI();
}

function renderTabs(){
  if(!tabsEl) tabsEl = document.getElementById('tabs');
  if(!tabsEl) return;
  tabsEl.innerHTML = '';
  categories.forEach((cat)=>{
    const b = document.createElement('button');
    b.className = 'tab-btn' + (cat===activeCategory?' active':'');
    b.textContent = catLabel(cat);
    b.onclick = ()=>{
      document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderGrid(cat);
    };
    tabsEl.appendChild(b);
  });
}

// Order Cart System
let syncCartUI = null;
(function(){
  const cart = {};
  let cartBtn, cartOverlay, cartClose, cartListEl;

  syncCartUI = function(){
    const totalCount = Object.values(cart).reduce((a,b)=>a+b, 0);
    const badgeEl = document.getElementById('cart-badge');
    if(badgeEl){
      if(totalCount > 0){
        badgeEl.textContent = totalCount;
        badgeEl.style.display = 'inline-flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }
    document.querySelectorAll('.menu-item').forEach(el=>{
      const name = el.dataset.name;
      const qty = cart[name] || 0;
      const qtyEl = el.querySelector('.item-qty');
      if(qty > 0){
        el.classList.add('in-cart');
        if(qtyEl) qtyEl.textContent = qty;
      } else {
        el.classList.remove('in-cart');
      }
    });
  };

  function addToCart(name){
    cart[name] = (cart[name] || 0) + 1;
    syncCartUI();
    if(cartOverlay && cartOverlay.classList.contains('open')) renderCartList();
  }

  function setQty(name, qty){
    if(qty <= 0){
      delete cart[name];
    } else {
      cart[name] = qty;
    }
    syncCartUI();
    renderCartList();
  }

  function findItemByFaName(name){
    for(const cat of categories){
      const found = menuData[cat].find(it => it.n === name);
      if(found) return found;
    }
    return null;
  }

  function renderCartList(){
    if(!cartListEl) cartListEl = document.getElementById('cart-list');
    if(!cartListEl) return;
    const dict = I18N[CURRENT_LANG] || I18N.fa;
    const names = Object.keys(cart).filter(n => cart[n] > 0);
    const totalRowEl = document.getElementById('cart-total-row');
    const totalAmountEl = document.getElementById('cart-total-amount');

    if(names.length === 0){
      cartListEl.innerHTML = `<div class="cart-empty">${dict.cart_empty}</div>`;
      if(totalRowEl) totalRowEl.style.display = 'none';
      return;
    }
    if(totalRowEl) totalRowEl.style.display = 'flex';

    cartListEl.innerHTML = '';
    let grandTotal = 0;

    names.forEach(name=>{
      const item = findItemByFaName(name);
      const displayName = item ? itemName(item) : name;
      const qty = cart[name];
      let subpriceHtml = '';

      if(item && item.p){
        const pNum = parseInt(String(item.p).replace(/[^\d]/g, ''), 10);
        if(!isNaN(pNum)){
          const itemSubtotal = pNum * qty;
          grandTotal += itemSubtotal;
          subpriceHtml = `<span class="cart-item-subprice">${item.p} × ${qty} = <b>${itemSubtotal}T</b></span>`;
        }
      }

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-item-info">
          <span class="cart-item-name">${displayName}</span>
          ${subpriceHtml}
        </div>
        <span class="cart-qty-ctrl">
          <button type="button" data-action="dec" data-name="${name}">−</button>
          <span class="qty-num">${qty}</span>
          <button type="button" data-action="inc" data-name="${name}">+</button>
        </span>`;
      cartListEl.appendChild(row);
    });

    if(totalAmountEl){
      totalAmountEl.textContent = `${grandTotal}T`;
    }

    cartListEl.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.onclick = ()=>{
        const name = btn.dataset.name;
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        setQty(name, (cart[name] || 0) + delta);
      };
    });
  }

  window.addEventListener('mahdiar:langchange', () => {
    if(cartOverlay && cartOverlay.classList.contains('open')) renderCartList();
  });

  function initApp(){
    tabsEl = document.getElementById('tabs');
    gridEl = document.getElementById('menu-grid');
    categories = Object.keys(menuData);
    activeCategory = categories[0];

    cartBtn = document.getElementById('cart-btn');
    cartOverlay = document.getElementById('cart-overlay');
    cartClose = document.getElementById('cart-close');
    cartListEl = document.getElementById('cart-list');

    renderTabs();
    renderGrid(activeCategory);

    if(gridEl){
      gridEl.addEventListener('click', (e)=>{
        const item = e.target.closest('.menu-item');
        if(item && item.dataset.name) addToCart(item.dataset.name);
      });
    }

    if(cartBtn){
      cartBtn.addEventListener('click', ()=>{
        renderCartList();
        if(cartOverlay) cartOverlay.classList.add('open');
      });
    }
    if(cartClose && cartOverlay){
      cartClose.addEventListener('click', ()=> cartOverlay.classList.remove('open'));
      cartOverlay.addEventListener('click', (e)=>{
        if(e.target === cartOverlay) cartOverlay.classList.remove('open');
      });
    }

    // Language Toggle
    const toggleBtn = document.getElementById('lang-toggle');
    if(toggleBtn){
      toggleBtn.textContent = LANG_LABELS[CURRENT_LANG] || CURRENT_LANG.toUpperCase();
      toggleBtn.addEventListener('click', () => {
        const idx = LANG_ORDER.indexOf(CURRENT_LANG);
        const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
        applyLanguage(next);
      });
    }
    if(CURRENT_LANG !== 'fa') applyLanguage(CURRENT_LANG);

    // Reserve Modal
    const resBtn = document.getElementById('reserve-btn');
    const modal = document.getElementById('reserve-modal');
    const modalClose = document.getElementById('reserve-close');

    function openModal(){ if(modal) modal.classList.add('open'); }
    function closeModal(){ if(modal) modal.classList.remove('open'); }

    if(resBtn) resBtn.addEventListener('click', openModal);
    if(modalClose) modalClose.addEventListener('click', closeModal);
    if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if(hamburger && mobileMenu){
      hamburger.addEventListener('click', ()=>{
        mobileMenu.classList.toggle('open');
      });
      mobileMenu.querySelectorAll('a').forEach(a=>{
        a.addEventListener('click', ()=> mobileMenu.classList.remove('open'));
      });
    }

    // Map Lazy Embed
    const mapWrap = document.getElementById('map-wrap');
    if(mapWrap){
      const address = "بابل، چهارراه شهدا، کوچه ایثار ۱، کافه گالری مهدیار";
      const mapUrl = "https://www.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed";

      const mapObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            const iframe = document.createElement('iframe');
            iframe.src = mapUrl;
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.style.border = "0";
            iframe.loading = "lazy";
            iframe.referrerPolicy = "no-referrer-when-downgrade";
            iframe.title = "کافه گالری مهدیار روی نقشه";
            mapWrap.innerHTML = '';
            mapWrap.appendChild(iframe);
            obs.unobserve(mapWrap);
          }
        });
      }, { rootMargin: "300px" });

      mapObs.observe(mapWrap);
    }

    // PWA & Installation System
    initPwaSystem();
  }

  function initPwaSystem(){
    let deferredPrompt = null;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const navInstallBtn = document.getElementById('pwa-install-nav-btn');
    const mobileInstallBtn = document.getElementById('pwa-install-mobile-btn');

    if(isStandalone) return;

    function showInstallButtons(){
      if(navInstallBtn) navInstallBtn.style.display = 'inline-flex';
      if(mobileInstallBtn) mobileInstallBtn.style.display = 'flex';
    }

    function hideInstallButtons(){
      if(navInstallBtn) navInstallBtn.style.display = 'none';
      if(mobileInstallBtn) mobileInstallBtn.style.display = 'none';
    }

    async function handleInstallClick(){
      if(deferredPrompt){
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if(outcome === 'accepted'){
          hideInstallButtons();
        }
        deferredPrompt = null;
      }
    }

    // Capture standard browser beforeinstallprompt (Android, Chrome, Edge, etc.)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallButtons();
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      hideInstallButtons();
    });

    if(navInstallBtn) navInstallBtn.addEventListener('click', handleInstallClick);
    if(mobileInstallBtn) mobileInstallBtn.addEventListener('click', handleInstallClick);

    // Register Service Worker for PWA capability & offline caching
    if('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')){
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            reg.onupdatefound = () => {
              const worker = reg.installing;
              if(worker){
                worker.onstatechange = () => {
                  if(worker.state === 'installed' && navigator.serviceWorker.controller){
                    // Updated SW
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.log('SW registration note:', err);
          });
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
