document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Icônes Lucide ---------- */
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    /* ---------- Cascade automatique : échelonne les enfants [data-reveal] ---------- */
    document.querySelectorAll('[data-stagger]').forEach((container) => {
        Array.from(container.children)
            .filter((child) => child.hasAttribute('data-reveal'))
            .forEach((el, i) => {
                if (!el.style.getPropertyValue('--d')) {
                    el.style.setProperty('--d', (i * 0.07).toFixed(2) + 's');
                }
            });
    });

    /* ---------- Reveal au chargement / scroll ---------- */
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => obs.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('revealed'));
    }

    /* ---------- Maquette hero : alertes en cascade (déclenchées au chargement) ---------- */
    const heroMock = document.getElementById('heroMock');
    if (heroMock) {
        requestAnimationFrame(() => heroMock.classList.add('is-live'));
    }

    /* ---------- Ombre de la navbar au scroll ---------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Menu mobile (tiroir) ---------- */
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');
    const scrim = document.getElementById('navScrim');
    const closeMenu = () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
    };
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const open = menu.classList.toggle('active');
            toggle.classList.toggle('active', open);
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        });
        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
        if (scrim) scrim.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    /* ---------- Accordéon FAQ ---------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
        const header = item.querySelector('.faq-header');
        const body = item.querySelector('.faq-body');
        header.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            faqItems.forEach((other) => {
                other.classList.remove('active');
                other.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
                other.querySelector('.faq-body').style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    /* ---------- Onglets des portails ---------- */
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const activateTab = (tab) => {
        tabs.forEach((t) => {
            const selected = t === tab;
            t.classList.toggle('is-active', selected);
            t.setAttribute('aria-selected', String(selected));
            t.tabIndex = selected ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) {
                panel.classList.toggle('is-active', selected);
                panel.hidden = !selected;
            }
        });
    };
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
            tabs[next].focus();
            activateTab(tabs[next]);
        });
    });

    /* ---------- Bouton flottant : masqué sur « Réserver » ou le footer ---------- */
    const fab = document.getElementById('fabReserver');
    const reserver = document.getElementById('reserver');
    const footer = document.querySelector('footer');
    const fabTargets = [reserver, footer].filter(Boolean);
    if (fab && fabTargets.length && 'IntersectionObserver' in window) {
        const visible = new Set();
        const fabObs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            });
            fab.classList.toggle('is-hidden', visible.size > 0);
        }, { threshold: 0 });
        fabTargets.forEach((t) => fabObs.observe(t));
    }

    /* ---------- Rim-light : la bordure lumineuse suit le curseur ---------- */
    document.querySelectorAll('.spot').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        });
    });

    /* =====================================================================
       UNIVERS ANTIGRAVITY — désactivé si l'utilisateur préfère moins de mouvement
       ===================================================================== */
    if (reduceMotion) return;

    /* ---------- Parallax des orbes (souris + scroll, lissé) ---------- */
    const orbs = Array.from(document.querySelectorAll('.orb')).map((el) => ({
        el,
        rate: parseFloat(getComputedStyle(el).getPropertyValue('--pr')) || 0.02,
        x: 0, y: 0,
    }));
    let pointerNX = 0, pointerNY = 0, scrollY = window.scrollY;

    window.addEventListener('pointermove', (e) => {
        pointerNX = e.clientX / window.innerWidth - 0.5;
        pointerNY = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    if (orbs.length) {
        const driftOrbs = () => {
            for (const o of orbs) {
                const tx = pointerNX * o.rate * 900;
                const ty = pointerNY * o.rate * 900 - scrollY * o.rate * 0.22;
                o.x += (tx - o.x) * 0.06;
                o.y += (ty - o.y) * 0.06;
                o.el.style.setProperty('--px', o.x.toFixed(1) + 'px');
                o.el.style.setProperty('--py', o.y.toFixed(1) + 'px');
            }
            requestAnimationFrame(driftOrbs);
        };
        driftOrbs();
    }

    /* ---------- Tilt 3D du visuel hero ---------- */
    const scene = document.querySelector('.tilt-scene');
    const tiltEl = scene && scene.querySelector('.tilt');
    if (scene && tiltEl) {
        scene.addEventListener('pointermove', (e) => {
            const r = scene.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            tiltEl.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
            tiltEl.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
        });
        scene.addEventListener('pointerleave', () => {
            tiltEl.style.setProperty('--rx', '0deg');
            tiltEl.style.setProperty('--ry', '0deg');
        });
    }

    /* ---------- Boutons magnétiques (CTA principaux) ---------- */
    document.querySelectorAll('.btn-lg, .nav-cta.desktop-cta').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) / r.width;
            const y = (e.clientY - r.top - r.height / 2) / r.height;
            btn.style.translate = (x * 8).toFixed(1) + 'px ' + (y * 8).toFixed(1) + 'px';
        });
        btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });

    /* ---------- Champ de particules en apesanteur (canvas) ---------- */
    const canvas = document.getElementById('bgParticles');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d', { alpha: true });
        // sage · coral · bleu doux · ink — la palette de la marque
        const palette = ['rgba(92,122,107,', 'rgba(216,138,110,', 'rgba(94,122,153,', 'rgba(31,42,38,'];
        let w = 0, h = 0, dpr = 1, parts = [], raf = null;
        const mouse = { x: -9999, y: -9999 };

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const seed = () => {
            const count = Math.round(Math.min(54, (w * h) / 26000));
            parts = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 1.4 + Math.random() * 3.2,
                vx: (Math.random() - 0.5) * 0.18,
                vy: -0.12 - Math.random() * 0.26,   // dérive vers le haut → apesanteur
                a: 0.10 + Math.random() * 0.22,
                c: palette[(Math.random() * palette.length) | 0],
            }));
        };
        const step = () => {
            ctx.clearRect(0, 0, w, h);
            for (const p of parts) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
                if (d2 < 14000) {                    // répulsion douce autour du curseur
                    const d = Math.sqrt(d2) || 1, f = (118 - d) / 118 * 0.6;
                    p.vx += dx / d * f;
                    p.vy += dy / d * f;
                }
                p.vx *= 0.97;
                p.vy = p.vy * 0.97 - 0.004;          // friction + légère poussée ascendante
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
                if (p.x < -12) p.x = w + 12; else if (p.x > w + 12) p.x = -12;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, 6.2832);
                ctx.fillStyle = p.c + p.a.toFixed(2) + ')';
                ctx.fill();
            }
            raf = requestAnimationFrame(step);
        };
        const start = () => { if (!raf) step(); };
        const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

        resize();
        seed();
        start();

        let rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => { resize(); seed(); }, 180);
        }, { passive: true });
        window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
        document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    }
});
