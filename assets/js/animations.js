// ===== ANIMATION CONTROLLER =====

class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.isReducedMotion = false;
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        this.init();
    }
    
    init() {
        this.checkReducedMotion();
        this.setupIntersectionObserver();
        this.bindEvents();
        this.initializeAnimations();
    }
    
    checkReducedMotion() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            this.handleReducedMotionChange();
        });
    }
    
    handleReducedMotionChange() {
        if (this.isReducedMotion) {
            // Disable complex animations
            document.body.classList.add('reduced-motion');
            this.pauseAllAnimations();
        } else {
            document.body.classList.remove('reduced-motion');
            this.resumeAllAnimations();
        }
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
            rootMargin: '50px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target, entry.intersectionRatio);
                } else {
                    this.pauseElementAnimation(entry.target);
                }
            });
        }, options);
        
        this.observers.set('main', observer);
        
        // Observe all animatable elements
        this.observeAnimatableElements();
    }
    
    observeAnimatableElements() {
        const observer = this.observers.get('main');
        if (!observer) return;
        
        // Elements with animation attributes
        const animatedElements = document.querySelectorAll('[data-animate], .animate-on-scroll, .feature-item, .workspace-card, .benefit-item, .rule-card');
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    bindEvents() {
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAnimations();
            } else {
                this.resumeAllAnimations();
            }
        });
        
        // Window focus/blur
        window.addEventListener('focus', () => this.resumeAllAnimations());
        window.addEventListener('blur', () => this.pauseAllAnimations());
        
        // Custom animation events
        document.addEventListener('triggerAnimation', (e) => {
            this.triggerCustomAnimation(e.detail);
        });
        
        document.addEventListener('pauseAnimation', (e) => {
            this.pauseCustomAnimation(e.detail);
        });
    }
    
    initializeAnimations() {
        // Initialize loading animations
        this.initLoadingAnimations();
        
        // Initialize hover effects
        this.initHoverEffects();
        
        // Initialize scroll-triggered animations
        this.initScrollAnimations();
        
        // Initialize particle interactions
        this.initParticleInteractions();
    }
    
    initLoadingAnimations() {
        const loadingElements = document.querySelectorAll('.loading-content > *');
        
        loadingElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                if (!this.isReducedMotion) {
                    element.style.transition = 'all 0.6s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }, index * 200);
        });
    }
    
    initHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.workspace-card, .rule-card, .feature-item, .benefit-item');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    this.animateCardHover(card, true);
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    this.animateCardHover(card, false);
                }
            });
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    this.animateButtonHover(button, true);
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    this.animateButtonHover(button, false);
                }
            });
            
            button.addEventListener('click', (e) => {
                if (!this.isReducedMotion) {
                    this.createRippleEffect(e);
                }
            });
        });
    }
    
    initScrollAnimations() {
        // Parallax effects for backgrounds
        window.addEventListener('scroll', this.throttle(() => {
            if (!this.isReducedMotion) {
                this.updateParallaxEffects();
            }
        }, 16));
        
        // Progress animations
        this.initProgressAnimations();
    }
    
    initParticleInteractions() {
        // Mouse interaction with particles
        document.addEventListener('mousemove', this.throttle((e) => {
            if (!this.isReducedMotion && window.ParticleSystem) {
                this.handleMouseParticleInteraction(e);
            }
        }, 50));
        
        // Click burst effects
        document.addEventListener('click', (e) => {
            if (!this.isReducedMotion && window.casinoLanding?.particleSystem) {
                this.createClickBurst(e);
            }
        });
    }
    
    triggerElementAnimation(element, intersectionRatio) {
        if (this.animatedElements.has(element)) return;
        
        const animationType = element.dataset.animate || this.getDefaultAnimation(element);
        const delay = parseInt(element.dataset.delay) || 0;
        
        setTimeout(() => {
            this.animateElement(element, animationType, intersectionRatio);
            this.animatedElements.add(element);
        }, delay);
    }
    
    getDefaultAnimation(element) {
        if (element.classList.contains('feature-item') || element.classList.contains('benefit-item')) {
            return 'slide-left';
        } else if (element.classList.contains('workspace-card') || element.classList.contains('rule-card')) {
            return 'fade-in';
        } else {
            return 'fade-in';
        }
    }
    
    animateElement(element, animationType, intensity = 1) {
        if (this.isReducedMotion) {
            element.style.opacity = '1';
            return;
        }
        
        element.classList.add(`animate-${animationType}`);
        
        // Add intensity-based effects
        if (intensity > 0.7) {
            element.style.animationDuration = '0.6s';
        } else if (intensity > 0.4) {
            element.style.animationDuration = '0.8s';
        } else {
            element.style.animationDuration = '1s';
        }
        
        // Trigger completion callback
        element.addEventListener('animationend', () => {
            this.onAnimationComplete(element, animationType);
        }, { once: true });
    }
    
    onAnimationComplete(element, animationType) {
        element.classList.remove(`animate-${animationType}`);
        element.style.opacity = '1';
        element.style.transform = 'none';
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('animationComplete', {
            detail: { element, animationType }
        }));
    }
    
    pauseElementAnimation(element) {
        if (this.isReducedMotion) return;
        
        const animations = element.getAnimations();
        animations.forEach(animation => {
            animation.pause();
        });
    }
    
    resumeElementAnimation(element) {
        if (this.isReducedMotion) return;
        
        const animations = element.getAnimations();
        animations.forEach(animation => {
            animation.play();
        });
    }
    
    animateCardHover(card, isEntering) {
        const icon = card.querySelector('.card-icon, .feature-icon, .benefit-icon, .rule-icon');
        const content = card.querySelector('.feature-content, .benefit-content, .workspace-card h3, .rule-header h3');
        
        if (isEntering) {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            
            if (content) {
                content.style.color = 'var(--primary-gold)';
            }
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
            
            if (icon) {
                icon.style.transform = '';
            }
            
            if (content) {
                content.style.color = '';
            }
        }
    }
    
    animateButtonHover(button, isEntering) {
        if (isEntering) {
            button.style.transform = 'translateY(-2px) scale(1.05)';
            
            // Add glow effect
            if (button.classList.contains('btn-primary')) {
                button.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3)';
            }
        } else {
            button.style.transform = '';
            button.style.boxShadow = '';
        }
    }
    
    createRippleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    updateParallaxEffects() {
        const scrollY = window.pageYOffset;
        const sections = document.querySelectorAll('.section');
        
        sections.forEach((section, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollY * speed);
            
            // Apply parallax to background elements
            const particles = section.querySelector('.particles-bg');
            if (particles) {
                particles.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
    
    initProgressAnimations() {
        const progressElements = document.querySelectorAll('.progress-bar, .loading-progress');
        
        progressElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgress(element);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(element);
        });
    }
    
    animateProgress(element) {
        if (this.isReducedMotion) return;
        
        const targetWidth = element.dataset.progress || '100%';
        element.style.width = '0%';
        element.style.transition = 'width 2s ease-out';
        
        setTimeout(() => {
            element.style.width = targetWidth;
        }, 100);
    }
    
    handleMouseParticleInteraction(event) {
        const sections = document.querySelectorAll('.section.active');
        if (sections.length === 0) return;
        
        const activeSection = sections[0];
        const rect = activeSection.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Create temporary interactive particles
        if (window.casinoLanding?.particleSystem) {
            const sectionNames = ['hero', 'platform', 'workspace', 'benefits', 'apply', 'rules'];
            const currentSection = window.casinoLanding.getCurrentSection();
            const sectionName = sectionNames[currentSection];
            
            if (Math.random() < 0.1) { // 10% chance to create particle
                window.casinoLanding.particleSystem.addBurstEffect(sectionName, x, y, 3);
            }
        }
    }
    
    createClickBurst(event) {
        const x = event.clientX;
        const y = event.clientY;
        
        // Create visual burst effect
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--primary-gold);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                z-index: 9999;
                animation: burstParticle 0.8s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 50 + Math.random() * 30;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            particle.style.setProperty('--end-x', `${endX}px`);
            particle.style.setProperty('--end-y', `${endY}px`);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
        
        // Add burst animation keyframes if not exists
        if (!document.querySelector('#burst-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'burst-animation-styles';
            style.textContent = `
                @keyframes burstParticle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(var(--end-x) - ${x}px), calc(var(--end-y) - ${y}px)) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Animation queue management
    queueAnimation(element, animationType, delay = 0) {
        this.animationQueue.push({
            element,
            animationType,
            delay,
            timestamp: Date.now()
        });
        
        if (!this.isProcessingQueue) {
            this.processAnimationQueue();
        }
    }
    
    processAnimationQueue() {
        if (this.animationQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }
        
        this.isProcessingQueue = true;
        const animation = this.animationQueue.shift();
        
        setTimeout(() => {
            this.animateElement(animation.element, animation.animationType);
            this.processAnimationQueue();
        }, animation.delay);
    }
    
    // Custom animation triggers
    triggerCustomAnimation(config) {
        const { selector, animationType, delay = 0, stagger = 0 } = config;
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
            const totalDelay = delay + (index * stagger);
            this.queueAnimation(element, animationType, totalDelay);
        });
    }
    
    pauseCustomAnimation(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            this.pauseElementAnimation(element);
        });
    }
    
    // Utility methods
    pauseAllAnimations() {
        document.body.classList.add('animations-paused');
        
        // Pause CSS animations
        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }
    
    resumeAllAnimations() {
        document.body.classList.remove('animations-paused');
        
        // Resume CSS animations
        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
    
    // Throttle utility
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Public API
    animateSection(sectionIndex) {
        const sections = document.querySelectorAll('.section');
        const section = sections[sectionIndex];
        
        if (!section) return;
        
        const elements = section.querySelectorAll('[data-animate], .animate-on-scroll');
        elements.forEach((element, index) => {
            const animationType = element.dataset.animate || 'fade-in';
            const delay = index * 100;
            
            setTimeout(() => {
                this.animateElement(element, animationType);
            }, delay);
        });
    }
    
    resetSectionAnimations(sectionIndex) {
        const sections = document.querySelectorAll('.section');
        const section = sections[sectionIndex];
        
        if (!section) return;
        
        const elements = section.querySelectorAll('[class*="animate-"]');
        elements.forEach(element => {
            element.classList.remove(...Array.from(element.classList).filter(cls => cls.startsWith('animate-')));
            element.style.opacity = '';
            element.style.transform = '';
            this.animatedElements.delete(element);
        });
    }
    
    destroy() {
        // Clear observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear animation queue
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('focus', this.resumeAllAnimations);
        window.removeEventListener('blur', this.pauseAllAnimations);
        
        // Reset all animations
        this.animatedElements.clear();
        document.body.classList.remove('animations-paused', 'reduced-motion');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}