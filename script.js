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

    /* ---------- Demo form ---------- */
    const form = document.getElementById('demoForm');
    if (form) {
        const status = document.getElementById('formStatus');
        const content = document.getElementById('form-content');
        const success = document.getElementById('success-msg');
        const submitBtn = form.querySelector('.form-submit');
        const required = ['fname', 'lname', 'email', 'structure'];
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            status.textContent = '';
            let firstInvalid = null;

            required.forEach((id) => {
                const el = document.getElementById(id);
                const empty = !el.value.trim();
                el.classList.toggle('invalid', empty);
                if (empty && !firstInvalid) firstInvalid = el;
            });

            if (firstInvalid) {
                status.textContent = 'Veuillez remplir tous les champs obligatoires.';
                firstInvalid.focus();
                return;
            }

            const email = document.getElementById('email');
            if (!emailRe.test(email.value.trim())) {
                email.classList.add('invalid');
                status.textContent = 'Veuillez entrer une adresse e-mail valide.';
                email.focus();
                return;
            }

            // Simulation d'envoi (à brancher sur votre back-end / e-mail)
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours…';
            setTimeout(() => {
                content.hidden = true;
                success.hidden = false;
                success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1200);
        });

        // Retire l'état d'erreur dès que l'utilisateur corrige
        form.querySelectorAll('input, select, textarea').forEach((el) => {
            el.addEventListener('input', () => el.classList.remove('invalid'));
        });
    }
});
