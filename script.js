document.addEventListener('DOMContentLoaded', () => {
    // --- Reveal Animations on Scroll ---
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuLinks = document.querySelectorAll('.nav-menu a');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // --- Navbar Blur on Scroll ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.style.background = 'rgba(253, 250, 245, 0.9)';
            nav.style.boxShadow = 'var(--shadow-premium)';
        } else {
            nav.style.background = 'rgba(253, 250, 245, 0.8)';
            nav.style.boxShadow = 'none';
        }
    });

    // --- Form Handling ---
    const formContent = document.getElementById('form-content');
    const successMsg = document.getElementById('success-msg');
    const submitBtn = document.querySelector('.form-submit');

    window.submitForm = () => {
        const requiredFields = ['fname', 'lname', 'email', 'structure'];
        let isValid = true;
        
        const data = {};
        
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                data[id] = el.value.trim();
            }
        });

        if (!isValid) {
            showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            document.getElementById('email').style.borderColor = '#ef4444';
            showNotification('Veuillez entrer une adresse email valide.', 'error');
            return;
        }

        // Simulate API call
        submitBtn.innerHTML = 'Traitement en cours...';
        submitBtn.disabled = true;

        setTimeout(() => {
            formContent.style.display = 'none';
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500);
    };

    function showNotification(message, type = 'info') {
        // Simple alert for now, could be a toast system
        alert(message);
    }
});

// --- FAQ Accordion ---
function toggleFaq(header) {
    const item = header.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all other items
    document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        item.classList.add('active');
    }
}
