/* =========================================================
   Karefully — site vitrine
   Accordéon FAQ · menu mobile · formulaire de démo · animations d'entrée
   ========================================================= */

(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       Accordéon FAQ — un seul volet ouvert à la fois
       --------------------------------------------------------- */
    var faqList = document.getElementById('faqList');

    if (faqList) {
        var faqItems = Array.prototype.slice.call(faqList.querySelectorAll('.faq-item'));

        faqItems.forEach(function (item) {
            var trigger = item.querySelector('.faq-trigger');
            if (!trigger) return;

            trigger.addEventListener('click', function () {
                var willOpen = !item.classList.contains('is-open');

                faqItems.forEach(function (other) {
                    var otherTrigger = other.querySelector('.faq-trigger');
                    other.classList.remove('is-open');
                    if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                });

                if (willOpen) {
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /* ---------------------------------------------------------
       Tiroir de navigation mobile
       --------------------------------------------------------- */
    var navToggle = document.getElementById('navToggle');
    var navPanel = document.getElementById('navPanel');
    var navScrim = document.getElementById('navScrim');
    var navClose = document.getElementById('navClose');

    if (navToggle && navPanel && navScrim) {
        var menuOpen = false;

        var setMenu = function (open) {
            if (open === menuOpen) return;
            menuOpen = open;

            if (open) {
                // On rend visible avant d'animer, sinon la transition ne part pas
                navPanel.hidden = false;
                navScrim.hidden = false;
                requestAnimationFrame(function () {
                    navPanel.classList.add('is-open');
                    navScrim.classList.add('is-open');
                });
                document.body.style.overflow = 'hidden';
            } else {
                navPanel.classList.remove('is-open');
                navScrim.classList.remove('is-open');
                document.body.style.overflow = '';

                var hide = function () {
                    if (!menuOpen) {
                        navPanel.hidden = true;
                        navScrim.hidden = true;
                    }
                };
                if (reducedMotion) hide();
                else window.setTimeout(hide, 400);
            }

            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        };

        navToggle.addEventListener('click', function () { setMenu(!menuOpen); });
        navScrim.addEventListener('click', function () { setMenu(false); });
        if (navClose) navClose.addEventListener('click', function () {
            setMenu(false);
            navToggle.focus();
        });

        navPanel.addEventListener('click', function (event) {
            if (event.target.closest('a')) setMenu(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !menuOpen) return;
            setMenu(false);
            navToggle.focus();
        });

        // Tant que le tiroir est ouvert, le focus n'en sort pas
        navPanel.addEventListener('keydown', function (event) {
            if (event.key !== 'Tab' || !menuOpen) return;
            var focusable = navPanel.querySelectorAll('a[href], button');
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        // Le tiroir n'existe qu'en mobile : on le referme en repassant en desktop
        var desktopQuery = window.matchMedia('(min-width: 769px)');
        var onBreakpoint = function (event) { if (event.matches) setMenu(false); };
        if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpoint);
        else if (desktopQuery.addListener) desktopQuery.addListener(onBreakpoint);
    }

    /* ---------------------------------------------------------
       Nav : condensation au défilement
       --------------------------------------------------------- */
    var siteNav = document.getElementById('siteNav');

    if (siteNav) {
        var lastScrolled = null;
        var syncNav = function () {
            var scrolled = window.scrollY > 24;
            if (scrolled === lastScrolled) return;
            lastScrolled = scrolled;
            siteNav.classList.toggle('is-scrolled', scrolled);
        };
        syncNav();
        window.addEventListener('scroll', syncNav, { passive: true });
    }

    /* ---------------------------------------------------------
       Formulaire de démo
       --------------------------------------------------------- */
    var form = document.getElementById('demoForm');

    if (form) {
        var successBox = document.getElementById('formSuccess');
        var errorBox = document.getElementById('formError');
        var submitBtn = document.getElementById('demoSubmit');
        var submitLabel = submitBtn ? submitBtn.textContent : '';

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Validation native : on laisse le navigateur signaler les champs manquants
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (errorBox) errorBox.hidden = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi…';
            }

            var data = {};
            new FormData(form).forEach(function (value, key) {
                data[key] = typeof value === 'string' ? value : String(value);
            });
            data.consent = form.querySelector('#f-consent').checked;

            fetch('/api/demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('Requête refusée (' + response.status + ')');
                    return response.json();
                })
                .then(function (payload) {
                    if (!payload || payload.ok !== true) throw new Error('Réponse inattendue');

                    form.reset();
                    if (successBox) {
                        successBox.hidden = false;
                        successBox.scrollIntoView({
                            behavior: reducedMotion ? 'auto' : 'smooth',
                            block: 'center'
                        });
                    }
                })
                .catch(function () {
                    if (errorBox) errorBox.hidden = false;
                })
                .then(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = submitLabel;
                    }
                });
        });
    }

    /* ---------------------------------------------------------
       Animations d'entrée de section
       --------------------------------------------------------- */
    var revealTargets = document.querySelectorAll('.reveal');

    if (revealTargets.length) {
        if (reducedMotion || !('IntersectionObserver' in window)) {
            // Sans observateur (ou en mouvement réduit) tout reste visible d'emblée
            Array.prototype.forEach.call(revealTargets, function (el) {
                el.classList.add('is-visible');
            });
        } else {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

            Array.prototype.forEach.call(revealTargets, function (el) {
                observer.observe(el);
            });
        }
    }

    /* ---------------------------------------------------------
       Mesure d'audience — chargée uniquement après consentement

       Google Analytics dépose des cookies et transfère des données hors du
       site : sous RGPD/ePrivacy, rien ne doit partir vers Google avant un
       accord explicite. Le script n'est donc pas dans le HTML ; il est injecté
       ici seulement si l'utilisateur accepte. Un refus n'émet aucune requête.
       --------------------------------------------------------- */
    var ANALYTICS_ID = 'G-X1CWEL92PX';
    var CONSENT_KEY = 'karefully-consent';

    var readConsent = function () {
        try {
            return window.localStorage.getItem(CONSENT_KEY);
        } catch (error) {
            return null; // navigation privée ou stockage bloqué
        }
    };

    var writeConsent = function (value) {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (error) {
            /* sans stockage, le choix vaut pour la session en cours */
        }
    };

    var analyticsLoaded = false;

    var loadAnalytics = function () {
        if (analyticsLoaded) return;
        analyticsLoaded = true;

        var tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
        document.head.appendChild(tag);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        // GA4 anonymise les adresses IP par défaut : pas d'option à passer ici,
        // en transmettre une créerait un paramètre d'événement inutile sur chaque hit.
        window.gtag('config', ANALYTICS_ID);
    };

    var banner = document.getElementById('consentBanner');

    var closeBanner = function () {
        if (!banner) return;
        banner.classList.remove('is-visible');
        window.setTimeout(function () { banner.hidden = true; }, reducedMotion ? 0 : 320);
    };

    var openBanner = function () {
        if (!banner) return;
        banner.hidden = false;
        requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    };

    if (readConsent() === 'granted') loadAnalytics();

    if (banner) {
        var accept = document.getElementById('consentAccept');
        var refuse = document.getElementById('consentRefuse');

        if (!readConsent()) openBanner();

        if (accept) accept.addEventListener('click', function () {
            writeConsent('granted');
            loadAnalytics();
            closeBanner();
        });

        if (refuse) refuse.addEventListener('click', function () {
            writeConsent('denied');
            closeBanner();
        });

        // Le retrait doit être aussi simple que l'accord : lien dans le pied de page
        var reopen = document.getElementById('consentReopen');
        if (reopen) reopen.addEventListener('click', function (event) {
            event.preventDefault();
            openBanner();
        });
    }
})();
