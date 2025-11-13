// ===== NAVIGATION CONTROLLER =====

class NavigationController {
    constructor() {
        this.navbar = null;
        this.navLinks = [];
        this.navToggle = null;
        this.navMenu = null;
        this.progressIndicator = null;
        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.scrollDirection = 'down';
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.bindEvents();
        this.createProgressIndicator();
        this.setupScrollBehavior();
    }
    
    setupElements() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
    }
    
    bindEvents() {
        // Mobile menu toggle
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Resize events
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    createProgressIndicator() {
        // Create progress indicator
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-indicator';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
        
        this.progressIndicator = progressBar;
    }
    
    setupScrollBehavior() {
        // Hide/show navbar on scroll
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.pageYOffset;
            
            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                // Scrolling down
                this.hideNavbar();
                this.scrollDirection = 'down';
            } else if (currentScrollY < this.lastScrollY) {
                // Scrolling up
                this.showNavbar();
                this.scrollDirection = 'up';
            }
            
            // Add scrolled class
            if (currentScrollY > 50) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
            
            this.lastScrollY = currentScrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.isMenuOpen = true;
        this.navToggle?.classList.add('active');
        this.navMenu?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        const menuItems = this.navMenu?.querySelectorAll('.nav-link');
        menuItems?.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navToggle?.classList.remove('active');
        this.navMenu?.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset menu item styles
        const menuItems = this.navMenu?.querySelectorAll('.nav-link');
        menuItems?.forEach(item => {
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
        });
    }
    
    handleNavClick(e) {
        e.preventDefault();
        
        const link = e.target.closest('.nav-link');
        const sectionIndex = parseInt(link.dataset.section);
        
        if (!isNaN(sectionIndex)) {
            // Close mobile menu if open
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Update active state
            this.setActiveLink(sectionIndex);
            
            // Trigger section change (this will be handled by main controller)
            if (window.casinoLanding) {
                window.casinoLanding.goToSection(sectionIndex);
            }
        }
    }
    
    handleScroll() {
        // Update progress indicator
        this.updateProgressIndicator();
    }
    
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    setActiveLink(sectionIndex) {
        this.navLinks.forEach((link, index) => {
            if (index === sectionIndex) {
                link.classList.add('active');
                this.animateActiveLink(link);
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    animateActiveLink(link) {
        // Add a subtle animation to the active link
        link.style.transform = 'scale(1.05)';
        setTimeout(() => {
            link.style.transform = '';
        }, 200);
    }
    
    updateProgressIndicator() {
        if (!this.progressIndicator) return;
        
        const totalSections = 6;
        const currentSection = window.casinoLanding?.getCurrentSection() || 0;
        const progress = ((currentSection + 1) / totalSections) * 100;
        
        this.progressIndicator.style.width = `${progress}%`;
    }
    
    hideNavbar() {
        if (this.navbar && !this.isMenuOpen) {
            this.navbar.style.transform = 'translateY(-100%)';
        }
    }
    
    showNavbar() {
        if (this.navbar) {
            this.navbar.style.transform = 'translateY(0)';
        }
    }
    
    // Public methods
    getCurrentActiveIndex() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            return parseInt(activeLink.dataset.section) || 0;
        }
        return 0;
    }
    
    highlightSection(sectionIndex) {
        this.setActiveLink(sectionIndex);
        this.updateProgressIndicator();
    }
    
    addNavigationItem(text, sectionIndex, insertBefore = null) {
        const navItem = document.createElement('a');
        navItem.href = `#section-${sectionIndex}`;
        navItem.className = 'nav-link';
        navItem.dataset.section = sectionIndex.toString();
        navItem.textContent = text;
        
        navItem.addEventListener('click', this.handleNavClick.bind(this));
        
        if (insertBefore && this.navMenu) {
            this.navMenu.insertBefore(navItem, insertBefore);
        } else if (this.navMenu) {
            this.navMenu.appendChild(navItem);
        }
        
        // Update navLinks array
        this.navLinks = document.querySelectorAll('.nav-link');
        
        return navItem;
    }
    
    removeNavigationItem(sectionIndex) {
        const linkToRemove = document.querySelector(`.nav-link[data-section="${sectionIndex}"]`);
        if (linkToRemove) {
            linkToRemove.remove();
            this.navLinks = document.querySelectorAll('.nav-link');
        }
    }
    
    updateNavigationText(sectionIndex, newText) {
        const link = document.querySelector(`.nav-link[data-section="${sectionIndex}"]`);
        if (link) {
            link.textContent = newText;
        }
    }
    
    enableNavigation() {
        this.navLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });
    }
    
    disableNavigation() {
        this.navLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        });
    }
    
    showNavigationHint(sectionIndex, message, duration = 3000) {
        const link = document.querySelector(`.nav-link[data-section="${sectionIndex}"]`);
        if (!link) return;
        
        // Create hint element
        const hint = document.createElement('div');
        hint.className = 'nav-hint';
        hint.textContent = message;
        hint.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--dark-gray);
            color: var(--white);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
            border: 1px solid var(--primary-gold);
        `;
        
        // Position relative to link
        link.style.position = 'relative';
        link.appendChild(hint);
        
        // Show hint
        setTimeout(() => {
            hint.style.opacity = '1';
        }, 100);
        
        // Hide hint after duration
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 300);
        }, duration);
    }
    
    addNavigationBadge(sectionIndex, text, type = 'info') {
        const link = document.querySelector(`.nav-link[data-section="${sectionIndex}"]`);
        if (!link) return;
        
        // Remove existing badge
        const existingBadge = link.querySelector('.nav-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Create new badge
        const badge = document.createElement('span');
        badge.className = `nav-badge nav-badge-${type}`;
        badge.textContent = text;
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--secondary-red);
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 0.7rem;
            font-weight: bold;
            min-width: 16px;
            text-align: center;
            line-height: 1.2;
        `;
        
        if (type === 'success') {
            badge.style.background = '#4caf50';
        } else if (type === 'warning') {
            badge.style.background = '#ff6b35';
        } else if (type === 'info') {
            badge.style.background = 'var(--primary-gold)';
            badge.style.color = 'var(--black)';
        }
        
        link.style.position = 'relative';
        link.appendChild(badge);
        
        return badge;
    }
    
    removeNavigationBadge(sectionIndex) {
        const link = document.querySelector(`.nav-link[data-section="${sectionIndex}"]`);
        const badge = link?.querySelector('.nav-badge');
        if (badge) {
            badge.remove();
        }
    }
    
    animateNavigation(type = 'pulse') {
        switch (type) {
            case 'pulse':
                this.navbar?.classList.add('animate-pulse');
                setTimeout(() => {
                    this.navbar?.classList.remove('animate-pulse');
                }, 1000);
                break;
                
            case 'shake':
                this.navbar?.classList.add('animate-shake');
                setTimeout(() => {
                    this.navbar?.classList.remove('animate-shake');
                }, 500);
                break;
                
            case 'glow':
                this.navbar?.classList.add('animate-glow');
                setTimeout(() => {
                    this.navbar?.classList.remove('animate-glow');
                }, 2000);
                break;
        }
    }
    
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        // Remove progress indicator
        if (this.progressIndicator?.parentNode) {
            this.progressIndicator.parentNode.remove();
        }
        
        // Reset styles
        document.body.style.overflow = '';
        
        // Close mobile menu
        this.closeMobileMenu();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
}