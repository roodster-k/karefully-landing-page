document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Reveal on scroll ---------- */
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

    /* ---------- Navbar shadow on scroll ---------- */
    const navbar = document.getElementById('navbar');
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Mobile menu ---------- */
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
        if (scrim) scrim.addEventListener('click', closeMenu); /* [10] clic sur l'overlay ferme le menu */
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    /* ---------- FAQ accordion ---------- */
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

    /* ---------- Portal tabs ---------- */
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

    /* ---------- Carousel du hero ---------- */
    const hc = document.getElementById('heroCarousel');
    if (hc) {
        const track = hc.querySelector('.hc-track');
        const slides = Array.from(hc.querySelectorAll('.hc-slide'));
        const dots = Array.from(hc.querySelectorAll('.hc-dot'));
        const prevBtn = hc.querySelector('.hc-prev');
        const nextBtn = hc.querySelector('.hc-next');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const AUTOPLAY = 5500;
        let index = 0;
        let timer = null;

        const update = () => {
            track.style.transform = `translateX(${-index * 100}%)`;
            dots.forEach((d, i) => {
                d.classList.toggle('is-active', i === index);
                d.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
            slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
        };
        const goTo = (i) => { index = (i + slides.length) % slides.length; update(); };
        const next = () => goTo(index + 1);
        const prev = () => goTo(index - 1);

        const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
        const start = () => { if (reduce) return; stop(); timer = setInterval(next, AUTOPLAY); };

        nextBtn.addEventListener('click', () => { next(); start(); });
        prevBtn.addEventListener('click', () => { prev(); start(); });
        dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); start(); }));

        hc.addEventListener('mouseenter', stop);
        hc.addEventListener('mouseleave', start);
        hc.addEventListener('focusin', stop);
        hc.addEventListener('focusout', start);
        hc.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { prev(); start(); }
            else if (e.key === 'ArrowRight') { next(); start(); }
        });

        let touchX = null;
        hc.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
        hc.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
            touchX = null;
            start();
        }, { passive: true });

        document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

        update();
        start();
    }

    /* ---------- Bouton flottant : masqué quand la section « Réserver » OU le footer est visible ---------- */
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
});
