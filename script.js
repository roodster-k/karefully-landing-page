document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Icônes Lucide ---------- */
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

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
});
