// ============================================
// SEBS GLOBAL - ANIMATED PARTICLE SYSTEM
// Canlı, Dikkat Çekici Animasyonlar
// ============================================

// Particle System
class ParticleSystem {
    constructor(container) {
        this.container = container || document.body;
        this.particles = [];
        this.particleCount = 50;
        this.init();
    }

    init() {
        // Create particles container
        this.particlesContainer = document.createElement('div');
        this.particlesContainer.className = 'particles';
        this.container.appendChild(this.particlesContainer);

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        // Navy & Gold palet
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

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in, .reveal, .card, .feature-card, .simulation-card, .stat-card, .category-card');
        this.init();
    }

    init() {
        // Create Intersection Observer
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

        // Observe all elements
        this.elements.forEach(el => {
            observer.observe(el);
        });
    }
}

// Parallax Effect
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

// Cursor Glow Effect
class CursorGlow {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });

        // Add glow on interactive elements
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

// Gradient Animation - sadece .gradient-text için (hero başlık sabit kalsın)
class GradientAnimation {
    constructor() {
        this.elements = document.querySelectorAll('.gradient-text');
        this.angle = 0;
        this.lastTime = 0;
        this.init();
    }

    init() {
        if (!this.elements.length) return;
        const step = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const delta = timestamp - this.lastTime;
            this.lastTime = timestamp;
            this.angle = (this.angle + (delta * 0.02)) % 360;
            this.elements.forEach(el => {
                el.style.background = `linear-gradient(${this.angle}deg, #1e40af 0%, #3b82f6 100%)`;
                if (el.style.webkitBackgroundClip) {
                    el.style.webkitBackgroundClip = 'text';
                    el.style.webkitTextFillColor = 'transparent';
                }
            });
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
}

// Initialize all animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Particle System
    new ParticleSystem();
    
    // Scroll Animations
    new ScrollAnimations();
    
    // Parallax Effect
    new ParallaxEffect();
    
    // Cursor Glow (optional - can be disabled for performance)
    // new CursorGlow();
    
    // Gradient Animation
    new GradientAnimation();
    
    // Header scroll effect (requestAnimationFrame throttling)
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
    
    // Hafif 3D tilt - feature ve simulation kartları
    const cards = document.querySelectorAll('.feature-card, .simulation-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    console.log('✅ Animations initialized');
});
