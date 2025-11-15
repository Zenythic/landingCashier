// ===== MAIN APPLICATION CONTROLLER =====

class CasinoLanding {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 7;
        this.isTransitioning = false;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.scrollThreshold = 50;
        this.lastScrollTime = 0;
        this.scrollDelay = 800;
        
        this.init();
    }
    
    init() {
        this.checkMobileDevice();
        this.bindEvents();
        this.initializeComponents();
        this.startLoadingSequence();
        this.updateNavigationArrows();
    }
    
    checkMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        if (!isMobile) {
            const desktopWarning = document.getElementById('desktop-warning');
            if (desktopWarning) {
                desktopWarning.style.display = 'flex';
            }
            return;
        }
        
        // Hide desktop warning if mobile
        const desktopWarning = document.getElementById('desktop-warning');
        if (desktopWarning) {
            desktopWarning.style.display = 'none';
        }
    }
    
    bindEvents() {
        // Navigation arrow events
        const navMain = document.getElementById('nav-main');
        const navBack = document.getElementById('nav-back');
        
        if (navMain) navMain.addEventListener('click', () => this.nextSection());
        if (navBack) navBack.addEventListener('click', () => this.prevSection());
        
        
        // Navigation events
        document.addEventListener('wheel', this.handleWheel.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Button events
        const nextSectionButtons = document.querySelectorAll('[data-next-section]');
        nextSectionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetSection = parseInt(e.target.closest('[data-next-section]').dataset.nextSection);
                if (!isNaN(targetSection)) {
                    this.goToSection(targetSection);
                }
            });
        });
        
        // Modal events
        const requirementsBtn = document.getElementById('requirements-btn');
        const modalClose = document.getElementById('modal-close');
        const modal = document.getElementById('requirements-modal');
        const finalApplyBtn = document.getElementById('final-apply-btn');
        
        if (requirementsBtn) {
            requirementsBtn.addEventListener('click', () => this.openModal('requirements-modal'));
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal('requirements-modal'));
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('requirements-modal');
                }
            });
        }
        
        // Application form events
        const applicationFormBtn = document.getElementById('application-form-btn');
        const applicationModalClose = document.getElementById('application-modal-close');
        const applicationModal = document.getElementById('application-modal');
        const whatsappSubmit = document.getElementById('whatsapp-submit');
        
        if (applicationFormBtn) {
            applicationFormBtn.addEventListener('click', () => this.openModal('application-modal'));
        }
        
        if (applicationModalClose) {
            applicationModalClose.addEventListener('click', () => this.closeModal('application-modal'));
        }
        
        if (applicationModal) {
            applicationModal.addEventListener('click', (e) => {
                if (e.target === applicationModal) {
                    this.closeModal('application-modal');
                }
            });
        }
        
        if (whatsappSubmit) {
            whatsappSubmit.addEventListener('click', () => this.handleWhatsAppSubmit());
        }
        
        // Form conditional logic
        const hasClientsRadios = document.querySelectorAll('input[name="has-clients"]');
        const clientCountGroup = document.getElementById('client-count-group');
        
        hasClientsRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'si') {
                    clientCountGroup.style.display = 'flex';
                } else {
                    clientCountGroup.style.display = 'none';
                }
            });
        });
        
        // Rule card events
        const ruleCards = document.querySelectorAll('.rule-card[data-rule]');
        ruleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const ruleType = card.dataset.rule;
                this.openModal(`rule-${ruleType}-modal`);
            });
        });
        
        // Rule modal close events
        const ruleModalCloses = document.querySelectorAll('.modal .modal-close');
        ruleModalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close modals when clicking outside
        const ruleModals = document.querySelectorAll('.modal[id^="rule-"]');
        ruleModals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    initializeComponents() {
        // Initialize particles
        if (typeof ParticleSystem !== 'undefined') {
            this.particleSystem = new ParticleSystem();
            this.particleSystem.init();
        }
        
        // Initialize animations
        if (typeof AnimationController !== 'undefined') {
            this.animationController = new AnimationController();
            this.animationController.init();
        }
        
        // Initialize navigation
        if (typeof NavigationController !== 'undefined') {
            this.navigationController = new NavigationController();
            this.navigationController.init();
        }
    }
    
    startLoadingSequence() {
        const loadingScreen = document.getElementById('loading-screen');
        
        // Simulate loading time
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                
                // Start initial animations after loading
                setTimeout(() => {
                    this.animateCurrentSection();
                }, 500);
            }
        }, 3000);
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - this.lastScrollTime < this.scrollDelay || this.isTransitioning) {
            return;
        }
        
        this.lastScrollTime = now;
        
        if (e.deltaY > 0) {
            this.nextSection();
        } else {
            this.prevSection();
        }
    }
    
    handleKeydown(e) {
        if (this.isTransitioning) return;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                this.nextSection();
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.prevSection();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSection(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSection(this.totalSections - 1);
                break;
        }
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
    }
    
    handleTouchEnd(e) {
        if (this.isTransitioning) return;
        
        this.touchEndY = e.changedTouches[0].clientY;
        this.touchEndX = e.changedTouches[0].clientX;
        
        const deltaY = this.touchStartY - this.touchEndY;
        const deltaX = this.touchStartX - this.touchEndX;
        
        // Determine if it's a vertical or horizontal swipe
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            // Vertical swipe
            if (Math.abs(deltaY) > this.scrollThreshold) {
                if (deltaY > 0) {
                    this.nextSection();
                } else {
                    this.prevSection();
                }
            }
        }
    }
    
    handleNavClick(e) {
        e.preventDefault();
        const sectionIndex = parseInt(e.target.dataset.section);
        if (!isNaN(sectionIndex)) {
            this.goToSection(sectionIndex);
        }
    }
    
    handleScrollButton(e) {
        e.preventDefault();
        const targetSection = parseInt(e.target.closest('[data-scroll]').dataset.scroll);
        if (!isNaN(targetSection)) {
            this.goToSection(targetSection);
        }
    }
    
    handleResize() {
        // Recalculate dimensions if needed
        if (this.particleSystem) {
            this.particleSystem.handleResize();
        }
        
        // Update navigation arrows visibility
        this.updateNavigationArrows();
    }
    
    updateNavigationArrows() {
        const navMain = document.getElementById('nav-main');
        const navBack = document.getElementById('nav-back');
        
        // Show/hide back arrow
        if (navBack) {
            navBack.style.display = this.currentSection > 0 ? 'flex' : 'none';
        }
        
        // Show/hide main arrow and set direction
        if (navMain) {
            if (this.currentSection < this.totalSections - 1) {
                navMain.style.display = 'flex';
                this.setArrowDirection(navMain);
            } else {
                navMain.style.display = 'none';
            }
        }
    }
    
    setArrowDirection(arrow) {
        // All arrows point down, but transitions vary
        const icon = arrow.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-chevron-down';
        }
    }
    
    
    nextSection() {
        if (this.currentSection < this.totalSections - 1) {
            this.goToSection(this.currentSection + 1);
        }
    }
    
    prevSection() {
        if (this.currentSection > 0) {
            this.goToSection(this.currentSection - 1);
        }
    }
    
    goToSection(index) {
        if (index === this.currentSection || this.isTransitioning) return;
        if (index < 0 || index >= this.totalSections) return;
        
        this.isTransitioning = true;
        
        const sections = document.querySelectorAll('.section');
        const currentSectionEl = sections[this.currentSection];
        const targetSectionEl = sections[index];
        
        // Update navigation arrows
        this.updateNavigationArrows();
        
        // Animate transition
        this.animateTransition(currentSectionEl, targetSectionEl, index > this.currentSection);
        
        // Update current section
        this.currentSection = index;
        
        // Update particles
        if (this.particleSystem) {
            this.particleSystem.updateSection(index);
        }
        
        // Re-enable transitions after animation
        setTimeout(() => {
            this.isTransitioning = false;
            this.animateCurrentSection();
        }, 800);
    }
    
    animateTransition(currentSection, targetSection, isForward) {
        // Remove active class from current section
        currentSection.classList.remove('active');
        
        // Get the transition direction (where new section comes from)
        const transitionDirection = this.getTransitionDirection();
        
        // Set initial position for target section based on transition direction
        if (isForward) {
            switch (transitionDirection) {
                case 'bottom':
                    targetSection.style.transform = 'translateY(100vh)';
                    currentSection.style.transform = 'translateY(-100vh)';
                    break;
                case 'right':
                    targetSection.style.transform = 'translateX(100vw)';
                    currentSection.style.transform = 'translateX(-100vw)';
                    break;
                case 'left':
                    targetSection.style.transform = 'translateX(-100vw)';
                    currentSection.style.transform = 'translateX(100vw)';
                    break;
                default:
                    targetSection.style.transform = 'translateY(100vh)';
                    currentSection.style.transform = 'translateY(-100vh)';
            }
        } else {
            // Going back - always slide from left
            targetSection.style.transform = 'translateX(-100vw)';
            currentSection.style.transform = 'translateX(100vw)';
        }
        
        // Trigger transition
        requestAnimationFrame(() => {
            targetSection.classList.add('active');
            targetSection.style.transform = 'translateY(0) translateX(0)';
            
            // Reset current section after transition
            setTimeout(() => {
                currentSection.style.transform = '';
                if (!currentSection.classList.contains('active')) {
                    currentSection.classList.remove('prev');
                }
            }, 800);
        });
    }
    
    getTransitionDirection() {
        // Define where each new section enters from (never from top)
        const transitions = ['bottom', 'right', 'left', 'bottom', 'right', 'left', 'bottom'];
        return transitions[this.currentSection] || 'bottom';
    }
    
    animateCurrentSection() {
        const sections = document.querySelectorAll('.section');
        const currentSectionEl = sections[this.currentSection];
        
        if (!currentSectionEl) return;
        
        // Animate section content
        const animatedElements = currentSectionEl.querySelectorAll('[data-animate]');
        animatedElements.forEach((element, index) => {
            const animationType = element.dataset.animate;
            const delay = index * 100;
            
            setTimeout(() => {
                element.classList.add(`animate-${animationType}`);
            }, delay);
        });
        
        // Trigger section-specific animations
        this.triggerSectionAnimations(this.currentSection);
    }
    
    triggerSectionAnimations(sectionIndex) {
        switch (sectionIndex) {
            case 0: // Hero
                this.animateHeroSection();
                break;
            case 1: // Platform
                this.animatePlatformSection();
                break;
            case 2: // Workspace
                this.animateWorkspaceSection();
                break;
            case 3: // Benefits
                this.animateBenefitsSection();
                break;
            case 4: // Apply
                this.animateApplySection();
                break;
            case 5: // Rules
                this.animateRulesSection();
                break;
            case 6: // Final Apply
                this.animateFinalApplySection();
                break;
        }
    }
    
    animateHeroSection() {
        const titleLines = document.querySelectorAll('.title-line');
        titleLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    animatePlatformSection() {
        const features = document.querySelectorAll('.feature-item');
        features.forEach((feature, index) => {
            setTimeout(() => {
                feature.classList.add('animate-slide-left');
            }, index * 150);
        });
        
        const mockup = document.querySelector('.platform-mockup');
        if (mockup) {
            setTimeout(() => {
                mockup.classList.add('animate-slide-right');
            }, 300);
        }
    }
    
    animateWorkspaceSection() {
        const cards = document.querySelectorAll('.workspace-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in');
            }, index * 200);
        });
    }
    
    animateFinalApplySection() {
        const title = document.querySelector('#final-apply .section-title');
        const subtitle = document.querySelector('#final-apply .section-subtitle');
        const cta = document.querySelector('.final-apply-cta');
        
        if (title) title.classList.add('animate-fade-in');
        if (subtitle) setTimeout(() => subtitle.classList.add('animate-fade-in'), 200);
        if (cta) setTimeout(() => cta.classList.add('animate-bounce'), 400);
    }
    
    handleWhatsAppSubmit() {
        // Build WhatsApp message
        const message = 'Hola, quiero ser cajero, mi nombre es: '
        const whatsappNumber = '+5493517512136';
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Close modal and show success message
        this.closeModal('application-modal');
        this.showNotification('¡Aplicación enviada! Te contactaremos pronto por WhatsApp.', 'success');
    }
    
    buildWhatsAppMessage(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const whatsapp = formData.get('whatsapp');
        const birthdate = formData.get('birthdate');
        const experience = formData.get('experience');
        const hasClients = formData.get('has-clients');
        const clientCount = formData.get('client-count') || 'No especificado';
        
        const experienceLabels = {
            'nada': 'Nada',
            'mediana': 'Mediana',
            'mucha': 'Mucha',
            'experto': 'Soy un experto'
        };
        
        const clientCountLabels = {
            'menos-50': 'Menos de 50',
            'menos-100': 'Menos de 100',
            'menos-500': 'Menos de 500',
            'menos-1000': 'Menos de 1000'
        };
        
        let message = `🎰 *APLICACIÓN PARA CAJERO DE CASINO ONLINE* 🎰\n\n`;
        message += `👤 *INFORMACIÓN PERSONAL*\n`;
        message += `• Nombre: ${name}\n`;
        message += `• Email: ${email}\n`;
        message += `• WhatsApp: +54 ${whatsapp}\n`;
        message += `• Fecha de nacimiento: ${birthdate}\n\n`;
        
        message += `💼 *EXPERIENCIA LABORAL*\n`;
        message += `• Experiencia como cajero: ${experienceLabels[experience] || experience}\n\n`;
        
        message += `👥 *BASE DE CLIENTES*\n`;
        message += `• ¿Tienes base de clientes?: ${hasClients === 'si' ? 'Sí' : 'No'}\n`;
        if (hasClients === 'si') {
            message += `• Cantidad aproximada: ${clientCountLabels[clientCount] || clientCount}\n`;
        }
        message += `\n`;
        
        message += `✅ *CONFIRMACIONES*\n`;
        message += `• ✓ He leído y entendido toda la información\n`;
        message += `• ✓ Estoy plenamente interesado en el puesto\n`;
        message += `• ✓ Entiendo las consecuencias del spam\n\n`;
        
        message += `🚀 *¡Listo para comenzar!*`;
        
        return message;
    }
    
    animateBenefitsSection() {
        const percentage = document.querySelector('.percentage-display');
        if (percentage) {
            percentage.classList.add('animate-zoom-in');
        }
        
        const benefits = document.querySelectorAll('.benefit-item');
        benefits.forEach((benefit, index) => {
            setTimeout(() => {
                benefit.classList.add('animate-slide-left');
            }, index * 150);
        });
    }
    
    animateApplySection() {
        const title = document.querySelector('#apply .section-title');
        const subtitle = document.querySelector('#apply .section-subtitle');
        const cta = document.querySelector('.apply-cta');
        
        if (title) title.classList.add('animate-fade-in');
        if (subtitle) setTimeout(() => subtitle.classList.add('animate-fade-in'), 200);
        if (cta) setTimeout(() => cta.classList.add('animate-bounce'), 400);
    }
    
    animateRulesSection() {
        const cards = document.querySelectorAll('.rule-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-flip-x');
            }, index * 100);
        });
    }
    
    updateNavigation(activeIndex) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            if (index === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update progress indicator if exists
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((activeIndex + 1) / this.totalSections) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionIndex = Array.from(document.querySelectorAll('.section')).indexOf(entry.target);
                    if (sectionIndex !== -1 && sectionIndex !== this.currentSection) {
                        this.currentSection = sectionIndex;
                        this.updateNavigation(sectionIndex);
                    }
                }
            });
        }, options);
        
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Public API methods
    getCurrentSection() {
        return this.currentSection;
    }
    
    getTotalSections() {
        return this.totalSections;
    }
    
    isCurrentlyTransitioning() {
        return this.isTransitioning;
    }
}

// ===== UTILITY FUNCTIONS =====

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
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

// Smooth scroll to element
function smoothScrollTo(element, duration = 1000) {
    const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.casinoLanding = new CasinoLanding();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.body.classList.add('page-hidden');
    } else {
        // Resume animations when page becomes visible
        document.body.classList.remove('page-hidden');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasinoLanding;
}
