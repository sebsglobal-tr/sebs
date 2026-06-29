
class ParticleSystem {
    constructor(container) {
        this.container = container || document.body;
        this.particles = [];
        this.particleCount = 20;
        this.init();
    }

    init() {
        this.particlesContainer = document.createElement('div');
        this.particlesContainer.className = 'particles';
        this.container.appendChild(this.particlesContainer);

        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';

        const gradients = [
            'rgba(30, 64, 175, 0.2)',
            'rgba(59, 130, 246, 0.15)',
            'rgba(212, 168, 83, 0.12)',
            'rgba(255, 255, 255, 0.08)'
        ];
        particle.style.background = gradients[Math.floor(Math.random() * gradients.length)];

        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
    }
}

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in, .reveal, .card, .feature-card, .simulation-card, .stat-card, .category-card');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => {
            observer.observe(el);
        });
    }
}

class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.latestScrollY = 0;
        this.ticking = false;
        this.init();
    }

    init() {
        if (!this.elements.length) {
            return;
        }

        const update = () => {
            const scrolled = this.latestScrollY;
            this.elements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
            this.ticking = false;
        };

        const onScroll = () => {
            this.latestScrollY = window.pageYOffset;
            if (!this.ticking) {
                this.ticking = true;
                requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
}

class CursorGlow {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        this.pendingX = 0;
        this.pendingY = 0;
        this.raf = false;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.pendingX = e.clientX;
            this.pendingY = e.clientY;
            if (this.raf) return;
            this.raf = true;
            requestAnimationFrame(() => {
                this.cursor.style.left = this.pendingX + 'px';
                this.cursor.style.top = this.pendingY + 'px';
                this.raf = false;
            });
        });

        const interactiveElements = document.querySelectorAll('a, button, .card, .btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('glow');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('glow');
            });
        });
    }
}

class GradientAnimation {
    constructor() {
        this.elements = document.querySelectorAll('.gradient-text');
        this.angle = 0;
        this.timer = null;
        this.init();
    }

    init() {
        if (!this.elements.length) return;
        this.timer = window.setInterval(() => {
            this.angle = (this.angle + 2.5) % 360;
            this.elements.forEach(el => {
                el.style.background = `linear-gradient(${this.angle}deg, #1e40af 0%, #3b82f6 100%)`;
                el.style.webkitBackgroundClip = 'text';
                el.style.webkitTextFillColor = 'transparent';
            });
        }, 110);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (!reduceMotion) {
        new ParticleSystem();
    }

    new ScrollAnimations();

    if (!reduceMotion) {
        new ParallaxEffect();
    }

    if (!reduceMotion) {
        new GradientAnimation();
    }

    if (!reduceMotion && finePointer) {
        new CursorGlow();
    }

    const header = document.querySelector('header');
    let headerTicking = false;
    let headerScrollY = window.pageYOffset;

    const updateHeader = () => {
        if (headerScrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        headerTicking = false;
    };

    window.addEventListener('scroll', () => {
        headerScrollY = window.pageYOffset;
        if (!headerTicking) {
            headerTicking = true;
            requestAnimationFrame(updateHeader);
        }
    }, { passive: true });
    updateHeader();

    if (!reduceMotion && finePointer) {
        const cards = document.querySelectorAll('.feature-card, .simulation-card');
        cards.forEach(card => {
            let tiltRaf = false;
            let ev = null;
            card.addEventListener('mousemove', (e) => {
                ev = e;
                if (tiltRaf) return;
                tiltRaf = true;
                requestAnimationFrame(() => {
                    if (!ev) {
                        tiltRaf = false;
                        return;
                    }
                    const rect = card.getBoundingClientRect();
                    const x = (ev.clientX - rect.left) / rect.width - 0.5;
                    const y = (ev.clientY - rect.top) / rect.height - 0.5;
                    card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
                    tiltRaf = false;
                });
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
});
