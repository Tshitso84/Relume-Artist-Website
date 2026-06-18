/* ============================================================
   NOMASHENGE DLAMINI — main.js
   Three.js Interactive Background + GSAP Animations + Custom Audio
   ============================================================ */

'use strict';

// ============================================================
// THREE.JS — INTERACTIVE PARTICLE SPHERE BACKGROUND
// ============================================================

(function initThreeJS() {
    const canvas = document.getElementById('webgl-background');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    camera.position.z = 4.5;

    // ---- Particle Sphere ----
    const PARTICLE_COUNT = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);

    // Gold → Copper → Blue-glow palette
    const palette = [
        new THREE.Color(0xd4af37), // gold
        new THREE.Color(0xe8cc6a), // gold-light
        new THREE.Color(0xb87333), // copper
        new THREE.Color(0xa6e1fa), // blue glow
        new THREE.Color(0xffffff), // white
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Distribute points on a sphere using spherical coordinates
        const phi   = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;

        const radius = 1.8 + (Math.random() - 0.5) * 0.6;
        positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3]     = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = Math.random() * 2.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

    const material = new THREE.PointsMaterial({
        size:         0.025,
        vertexColors: true,
        transparent:  true,
        opacity:      0.72,
        sizeAttenuation: true,
    });

    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    // ---- Ambient "nebula" cloud ----
    const nebula_geo  = new THREE.BufferGeometry();
    const nebula_pos  = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
        nebula_pos[i * 3]     = (Math.random() - 0.5) * 9;
        nebula_pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
        nebula_pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
    }
    nebula_geo.setAttribute('position', new THREE.BufferAttribute(nebula_pos, 3));
    const nebula_mat = new THREE.PointsMaterial({
        color:       0xd4af37,
        size:        0.018,
        transparent: true,
        opacity:     0.18,
        sizeAttenuation: true,
    });
    const nebula = new THREE.Points(nebula_geo, nebula_mat);
    scene.add(nebula);

    // ---- Mouse tracking ----
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ---- Scroll tracking ----
    let scrollProgress = 0;
    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress  = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    });

    // ---- Clock ----
    const clock = new THREE.Clock();

    // ---- Animation Loop ----
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Smooth mouse follow
        mouse.x += (mouse.targetX - mouse.x) * 0.035;
        mouse.y += (mouse.targetY - mouse.y) * 0.035;

        // Slow auto-rotation
        sphere.rotation.y = elapsed * 0.08 + mouse.x * 0.3;
        sphere.rotation.x = elapsed * 0.04 - mouse.y * 0.2;

        // Scroll-based scale & z-drift
        sphere.position.z = scrollProgress * -1.5;
        sphere.scale.setScalar(1 - scrollProgress * 0.25);

        // Breathing effect on material opacity
        material.opacity = 0.55 + Math.sin(elapsed * 0.6) * 0.15;

        nebula.rotation.y = elapsed * 0.025;
        nebula.rotation.z = elapsed * 0.015;

        renderer.render(scene, camera);
    }

    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
})();


// ============================================================
// GSAP ANIMATIONS
// ============================================================

(function initGSAP() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ---- Header scroll effects ----
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const current = window.scrollY;
            header.classList.toggle('hide',     current > lastScroll && current > 80);
            header.classList.toggle('scrolled', current > 60);
            lastScroll = current;
        });
    }

    // ---- Hero entrance animations ----
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const revealText = document.querySelector('.reveal-text');
    if (revealText) {
        tl.to(revealText, {
            opacity: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.4,
            delay: 0.3,
        });
    }

    const revealSub = document.querySelector('.reveal-subtitle');
    if (revealSub) {
        tl.to(revealSub, {
            opacity: 1,
            y: 0,
            duration: 0.9,
        }, '-=0.7');
    }

    const heroDetail = document.querySelector('.hero-detail.fade-in-up');
    if (heroDetail) {
        tl.to(heroDetail, {
            opacity: 1,
            y: 0,
            duration: 0.9,
        }, '-=0.55');
    }

    // ---- Scroll-triggered fade-in-up ----
    if (typeof ScrollTrigger !== 'undefined') {
        const fadeEls = document.querySelectorAll('.fade-in-up');
        fadeEls.forEach((el) => {
            // Skip hero detail already animated by timeline
            if (el.classList.contains('hero-detail')) return;

            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start:   'top 88%',
                    once:    true,
                },
                opacity:  1,
                y:        0,
                duration: 0.85,
                ease:     'power2.out',
            });
        });

        // ---- Staggered children inside music list ----
        const tracks = document.querySelectorAll('.track.fade-in-up');
        tracks.forEach((track, i) => {
            gsap.to(track, {
                scrollTrigger: {
                    trigger: track,
                    start:   'top 90%',
                    once:    true,
                },
                opacity:  1,
                y:        0,
                duration: 0.7,
                delay:    i * 0.15,
                ease:     'power2.out',
            });
        });

        // ---- Section title reveal ----
        const sectionTitles = document.querySelectorAll('.section-title.fade-in-up');
        sectionTitles.forEach((title) => {
            gsap.to(title, {
                scrollTrigger: {
                    trigger: title,
                    start:   'top 92%',
                    once:    true,
                },
                opacity:  1,
                y:        0,
                duration: 0.7,
                ease:     'power2.out',
            });
        });
    }
})();


// ============================================================
// ACCORDION (About & Work pages)
// ============================================================

function toggleAccordion(headerEl) {
    const item   = headerEl.parentElement;
    const isOpen = item.classList.contains('active');

    // Close all items
    document.querySelectorAll('.accordion-item').forEach((i) => {
        i.classList.remove('active');
    });

    // Open clicked item if it was not already open
    if (!isOpen) {
        item.classList.add('active');
    }
}

// Open first accordion by default (if present)
(function openFirstAccordion() {
    const first = document.querySelector('.accordion-item');
    if (first && !first.classList.contains('active')) {
        first.classList.add('active');
    }
})();


// ============================================================
// CUSTOM AUDIO PLAYER
// ============================================================

(function initAudioPlayers() {
    const trackCards = document.querySelectorAll('.track');
    if (!trackCards.length) return;

    trackCards.forEach((card) => {
        const audio     = card.querySelector('.audio-element');
        const playBtn   = card.querySelector('.play-btn');
        const icon      = playBtn  ? playBtn.querySelector('i')  : null;
        const timeline  = card.querySelector('.timeline-slider');
        const progress  = card.querySelector('.timeline-progress');
        const handle    = card.querySelector('.timeline-handle');
        const curTime   = card.querySelector('.current-time');
        const durTime   = card.querySelector('.duration-time');

        if (!audio || !playBtn) return;

        // Format seconds → mm:ss
        function formatTime(s) {
            if (isNaN(s) || !isFinite(s)) return '00:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        }

        // Update duration label once metadata loaded
        audio.addEventListener('loadedmetadata', () => {
            if (durTime) durTime.textContent = formatTime(audio.duration);
        });

        // Toggle play / pause
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause all other audios first
                document.querySelectorAll('.audio-element').forEach((a) => {
                    if (a !== audio) {
                        a.pause();
                        const otherCard = a.closest('.track');
                        if (otherCard) {
                            const btn  = otherCard.querySelector('.play-btn');
                            const ico  = btn ? btn.querySelector('i') : null;
                            if (btn)  btn.classList.remove('playing');
                            if (ico) { ico.classList.remove('fa-pause'); ico.classList.add('fa-play'); }
                        }
                    }
                });

                audio.play().catch(() => {});
                playBtn.classList.add('playing');
                if (icon) { icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); }
            } else {
                audio.pause();
                playBtn.classList.remove('playing');
                if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
            }
        });

        // Update progress bar & handle
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            if (progress) progress.style.width  = pct + '%';
            if (handle)   handle.style.left     = pct + '%';
            if (curTime)  curTime.textContent   = formatTime(audio.currentTime);
        });

        // Ended → reset
        audio.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
            if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
            if (progress) progress.style.width = '0%';
            if (handle)   handle.style.left    = '0%';
            if (curTime)  curTime.textContent  = '00:00';
        });

        // Click on timeline to seek
        if (timeline) {
            timeline.addEventListener('click', (e) => {
                const rect = timeline.getBoundingClientRect();
                const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (audio.duration) {
                    audio.currentTime = pct * audio.duration;
                }
            });

            // Drag seek
            let dragging = false;
            timeline.addEventListener('mousedown', () => { dragging = true; });
            window.addEventListener('mousemove', (e) => {
                if (!dragging) return;
                const rect = timeline.getBoundingClientRect();
                const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (audio.duration) {
                    audio.currentTime = pct * audio.duration;
                }
            });
            window.addEventListener('mouseup', () => { dragging = false; });
        }
    });
})();


// ============================================================
// MOBILE NAVIGATION TOGGLE
// ============================================================

(function initMobileNav() {
    const toggle   = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on nav link click (mobile)
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
})();


// ============================================================
// POETRY LINE HOVER (Work page enhancement)
// ============================================================

(function initPoetryLines() {
    document.querySelectorAll('.poem-content .line').forEach((line) => {
        line.addEventListener('mouseenter', function () {
            if (typeof gsap !== 'undefined') {
                gsap.to(this, { x: 10, duration: 0.25, ease: 'power2.out' });
            }
        });
        line.addEventListener('mouseleave', function () {
            if (typeof gsap !== 'undefined') {
                gsap.to(this, { x: 0,  duration: 0.25, ease: 'power2.out' });
            }
        });
    });
})();
