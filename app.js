// toggleMenu
const menuTrigger = document.querySelector('.menu-trigger');
const closeMenuBtn = document.getElementById('close-menu-btn');
const menuOverlay = document.getElementById('menu-overlay');

function toggleMenu(show) {
    if (!menuOverlay || !menuTrigger) return;

    menuOverlay.setAttribute('aria-hidden', !show);
    menuTrigger.setAttribute('aria-expanded', show);
    document.body.classList.toggle('no-scroll', show);

    if (show) closeMenuBtn?.focus();
    else menuTrigger.focus();
}

menuTrigger?.addEventListener('click', () => toggleMenu(true));
closeMenuBtn?.addEventListener('click', () => toggleMenu(false));


// toggleNextElement
function toggleNextElement(trigger) {
    const content = trigger?.nextElementSibling;
    if (!content) return;

    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', !expanded);
    content.style.display = expanded ? 'none' : 'block';
}


// navAccordion
document.querySelectorAll('.nav-accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => toggleNextElement(trigger));
});


// footerAccordion
document.querySelectorAll('.footer-col-title').forEach(toggle => {
    toggle.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
            toggleNextElement(toggle);
        }
    });
});


// handleFooterResize
function handleFooterResize() {
    if (window.innerWidth >= 1024) {
        document.querySelectorAll('.footer-links').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.footer-col-title .chevron').forEach(el => el.style.transform = '');
    } else {
        document.querySelectorAll('.footer-links').forEach(el => el.style.display = 'none');
    }
}

window.addEventListener('resize', handleFooterResize);
handleFooterResize();


// updateParallax
const parallaxImg = document.getElementById('parallax-img');

function updateParallax() {
    if (!parallaxImg) return;

    const hero = parallaxImg.closest('.article-hero');
    if (!hero) return;

    const rect = hero.getBoundingClientRect();

    if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const scrolled = -rect.top;
        const speed = 0.25;
        parallaxImg.style.transform = `translateY(${scrolled * speed}px)`;
    }
}

window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();


// changePhrase
const heroPhrases = [
    "Learning to become yourself",
    "Tu voz, tu camino",
    "Think free. Act responsible.",
    "Naturaleza que despierta tu mente",
    "Belong. Explore. Build your future.",
    "Aquí tu voz importa."
];

const titleElement = document.getElementById('dynamic-hero-title');
let phraseIndex = 0;

function changePhrase() {
    if (!titleElement) return;

    titleElement.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    titleElement.style.opacity = "0";
    titleElement.style.transform = "rotateX(90deg)";

    setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % heroPhrases.length;
        titleElement.textContent = heroPhrases[phraseIndex];

        titleElement.style.transition = "none";
        titleElement.style.transform = "rotateX(-90deg)";

        void titleElement.offsetWidth;

        titleElement.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
        titleElement.style.opacity = "1";
        titleElement.style.transform = "rotateX(0deg)";
    }, 800);
}

if (titleElement) setInterval(changePhrase, 7000);


// runCounter
function runCounter(el) {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const plus = el.getAttribute('data-plus') ? '+' : '';

    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    let current = 0;

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            el.textContent = plus + target + suffix;
            clearInterval(timer);
        } else {
            el.textContent = plus + Math.ceil(current) + suffix;
        }
    }, stepTime);
}


// revealObserver
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                const counter = entry.target.querySelector('h3[data-target]');
                if (counter && !counter.classList.contains('counted')) {
                    runCounter(counter);
                    counter.classList.add('counted');
                }
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
});


// fadeUpObserver
const fadeEls = document.querySelectorAll('.fade-up');

if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = (i % 4) * 0.07 + 's';
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => fadeObserver.observe(el));
} else {
    fadeEls.forEach(el => el.classList.add('visible'));
}

// — DATOS DE ARTÍCULOS —
const allPosts = Array.from(document.querySelectorAll('.post-card')).map(card => ({
    element: card.cloneNode(true),
    categories: (card.getAttribute('data-category') || '').trim().split(/\s+/)
}));

const postsGrid = document.getElementById('postsGrid');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryLinks = document.querySelectorAll('[data-filter-link]');

function renderPosts(category) {
    // Filtrar artículos según categoría
    const filtered = category === 'all'
        ? allPosts
        : allPosts.filter(post => post.categories.includes(category));

    // Limpiar el grid completamente
    postsGrid.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    // Insertar solo los artículos filtrados (clonados frescos)
    filtered.forEach(post => {
        const clone = post.element.cloneNode(true);
        clone.classList.remove('visible'); // reset animación
        postsGrid.appendChild(clone);

        // Re-aplicar fade-up observer al nuevo nodo
        requestAnimationFrame(() => {
            clone.classList.add('visible');
        });

        // Re-enlazar listeners de category links en los clones
        clone.querySelectorAll('[data-filter-link]').forEach(link => {
            link.addEventListener('click', () => {
                const filter = link.dataset.filterLink;
                setActiveFilter(filter);
                renderPosts(filter);
            });
        });
    });
}

function setActiveFilter(category) {
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        setActiveFilter(filter);
        renderPosts(filter);
    });
});

categoryLinks.forEach(link => {
    link.addEventListener('click', () => {
        const filter = link.dataset.filterLink;
        setActiveFilter(filter);
        renderPosts(filter);
        document.getElementById('todos-los-articulos').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});