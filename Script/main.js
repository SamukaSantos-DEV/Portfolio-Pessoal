(() => {
    'use strict';

    const birthDate = new Date(2007, 2, 8); // 08/03/2007
    const calculateAge = () => {
        const now = new Date();
        let age = now.getFullYear() - birthDate.getFullYear();
        const birthdayHasPassed = now.getMonth() > birthDate.getMonth() ||
            (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
        if (!birthdayHasPassed) age -= 1;
        return age;
    };

    const age = calculateAge();
    ['heroAge', 'aboutAge', 'factAge'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = age;
    });

    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    const siteHeader = document.getElementById('siteHeader');
    const backToTop = document.getElementById('backToTop');
    const progressBar = document.querySelector('.scroll-progress span');

    const onScroll = () => {
        const y = window.scrollY;
        siteHeader?.classList.toggle('scrolled', y > 24);
        backToTop?.classList.toggle('visible', y > 650);

        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (y / scrollable) * 100 : 0;
        if (progressBar) progressBar.style.width = `${Math.min(100, progress)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const closeMenu = () => {
        menuToggle?.setAttribute('aria-expanded', 'false');
        navMenu?.classList.remove('open');
        document.body.classList.remove('menu-open');
    };

    menuToggle?.addEventListener('click', () => {
        const open = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!open));
        navMenu?.classList.toggle('open', !open);
        document.body.classList.toggle('menu-open', !open);
    });

    navMenu?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });

    let scrollAnimationFrame = null;

    const smoothScrollTo = (destination, duration = 800) => {
        if (scrollAnimationFrame) cancelAnimationFrame(scrollAnimationFrame);

        const start = window.scrollY;
        const target = Math.max(0, Math.min(destination, document.documentElement.scrollHeight - window.innerHeight));
        const distance = target - start;

        if (Math.abs(distance) < 2) return;

        const startTime = performance.now();
        const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + distance * easeOutQuint(progress));

            if (progress < 1) {
                scrollAnimationFrame = requestAnimationFrame(animate);
            } else {
                scrollAnimationFrame = null;
            }
        };

        scrollAnimationFrame = requestAnimationFrame(animate);
    };

    const scrollToSection = (target) => {
        if (!target) return;
        if (target.id === 'inicio') {
            smoothScrollTo(0);
            return;
        }

        const focusElement = target.querySelector('.section-heading, .contact-card') || target;
        const topOffset = window.innerWidth <= 680 ? 80 : 96;
        const top = focusElement.getBoundingClientRect().top + window.scrollY - topOffset;
        smoothScrollTo(top);
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            scrollToSection(target);
            if (history.replaceState) history.replaceState(null, '', href);
        });
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((element) => {
        const delay = element.dataset.revealDelay;
        if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    const navLinks = [...document.querySelectorAll('.nav-link')];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    };

    const updateActiveSection = () => {
        const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
        if (atBottom && sections.length > 0) {
            setActiveLink(sections[sections.length - 1].id);
            return;
        }

        const scrollPosition = window.scrollY + Math.min(220, window.innerHeight * 0.35);
        let currentId = sections[0]?.id;

        sections.forEach((section) => {
            if (section.offsetTop <= scrollPosition) currentId = section.id;
        });

        if (currentId) setActiveLink(currentId);
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('load', updateActiveSection);
    updateActiveSection();

    const glow = document.querySelector('.cursor-glow');
    if (glow && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (event) => {
            glow.style.setProperty('--x', `${event.clientX}px`);
            glow.style.setProperty('--y', `${event.clientY}px`);
        }, { passive: true });
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('[data-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty('--ry', `${x * 3.3}deg`);
                card.style.setProperty('--rx', `${y * -2.8}deg`);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--rx', '0deg');
            });
        });

        const portraitStage = document.getElementById('portraitStage');
        portraitStage?.addEventListener('pointermove', (event) => {
            const rect = portraitStage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            portraitStage.style.transform = `rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
        });
        portraitStage?.addEventListener('pointerleave', () => {
            portraitStage.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
    }

    const previewVideos = document.querySelectorAll('.project-media video, .archive-media video');
    const playVideo = (video, restart = false) => {
        if (!(video instanceof HTMLVideoElement)) return;
        if (restart) {
            try { video.currentTime = 0; } catch (_) {}
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    };

    previewVideos.forEach((video) => {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;

        video.addEventListener('loadeddata', () => playVideo(video));
        video.addEventListener('mouseenter', () => playVideo(video, true));
        video.addEventListener('mouseleave', () => playVideo(video, true));
        video.addEventListener('ended', () => playVideo(video, true));
        playVideo(video);
    });
})();
