// ===== PARTICLE SYSTEM FOR CASINO EFFECTS =====

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvases = new Map();
        this.contexts = new Map();
        this.animationFrames = new Map();
        this.isRunning = false;
        this.currentSection = 0;
        
        this.config = {
            hero: {
                count: 50,
                color: '#FFD700',
                size: { min: 1, max: 3 },
                speed: { min: 0.5, max: 1.5 },
                opacity: { min: 0.3, max: 0.8 },
                type: 'stars'
            },
            platform: {
                count: 30,
                color: '#DC143C',
                size: { min: 2, max: 4 },
                speed: { min: 0.3, max: 1 },
                opacity: { min: 0.4, max: 0.7 },
                type: 'diamonds'
            },
            workspace: {
                count: 40,
                color: '#FFD700',
                size: { min: 1, max: 2 },
                speed: { min: 0.2, max: 0.8 },
                opacity: { min: 0.2, max: 0.6 },
                type: 'dots'
            },
            benefits: {
                count: 35,
                color: '#9932CC',
                size: { min: 2, max: 5 },
                speed: { min: 0.4, max: 1.2 },
                opacity: { min: 0.3, max: 0.7 },
                type: 'coins'
            },
            apply: {
                count: 45,
                color: '#DC143C',
                size: { min: 1, max: 3 },
                speed: { min: 0.5, max: 1.3 },
                opacity: { min: 0.4, max: 0.8 },
                type: 'hearts'
            },
            rules: {
                count: 25,
                color: '#FFD700',
                size: { min: 1, max: 2 },
                speed: { min: 0.1, max: 0.6 },
                opacity: { min: 0.2, max: 0.5 },
                type: 'squares'
            },
            'final-apply': {
                count: 60,
                color: '#FFD700',
                size: { min: 2, max: 4 },
                speed: { min: 0.6, max: 1.8 },
                opacity: { min: 0.5, max: 0.9 },
                type: 'stars'
            }
        };
    }
    
    init() {
        this.createCanvases();
        this.bindEvents();
        this.start();
    }
    
    createCanvases() {
        const sections = ['hero', 'platform', 'workspace', 'benefits', 'apply', 'rules', 'final-apply'];
        
        sections.forEach(section => {
            const container = document.getElementById(`particles-${section}`);
            if (!container) return;
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            
            container.appendChild(canvas);
            
            this.canvases.set(section, canvas);
            this.contexts.set(section, ctx);
            
            this.resizeCanvas(section);
            this.initParticles(section);
        });
    }
    
    resizeCanvas(section) {
        const canvas = this.canvases.get(section);
        const container = document.getElementById(`particles-${section}`);
        
        if (!canvas || !container) return;
        
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    initParticles(section) {
        const config = this.config[section];
        if (!config) return;
        
        const canvas = this.canvases.get(section);
        if (!canvas) return;
        
        const particles = [];
        
        for (let i = 0; i < config.count; i++) {
            particles.push(this.createParticle(canvas, config));
        }
        
        this.particles[section] = particles;
    }
    
    createParticle(canvas, config) {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: this.randomBetween(config.size.min, config.size.max),
            speedX: this.randomBetween(-config.speed.max, config.speed.max),
            speedY: this.randomBetween(-config.speed.max, config.speed.max),
            opacity: this.randomBetween(config.opacity.min, config.opacity.max),
            color: config.color,
            type: config.type,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: this.randomBetween(-0.02, 0.02),
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: this.randomBetween(0.01, 0.03)
        };
    }
    
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        this.animationFrames.forEach(frame => {
            if (frame) cancelAnimationFrame(frame);
        });
        this.animationFrames.clear();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.canvases.forEach((canvas, section) => {
            this.updateParticles(section);
            this.renderParticles(section);
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    updateParticles(section) {
        const particles = this.particles[section];
        const canvas = this.canvases.get(section);
        
        if (!particles || !canvas) return;
        
        particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Update rotation
            particle.angle += particle.rotationSpeed;
            
            // Update pulse
            particle.pulsePhase += particle.pulseSpeed;
            
            // Wrap around screen
            if (particle.x < -particle.size) {
                particle.x = canvas.width + particle.size;
            } else if (particle.x > canvas.width + particle.size) {
                particle.x = -particle.size;
            }
            
            if (particle.y < -particle.size) {
                particle.y = canvas.height + particle.size;
            } else if (particle.y > canvas.height + particle.size) {
                particle.y = -particle.size;
            }
        });
    }
    
    renderParticles(section) {
        const ctx = this.contexts.get(section);
        const canvas = this.canvases.get(section);
        const particles = this.particles[section];
        
        if (!ctx || !canvas || !particles) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.save();
            
            // Apply pulsing opacity
            const pulseOpacity = particle.opacity + Math.sin(particle.pulsePhase) * 0.2;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, pulseOpacity));
            
            // Move to particle position
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            
            // Draw particle based on type
            this.drawParticle(ctx, particle);
            
            ctx.restore();
        });
    }
    
    drawParticle(ctx, particle) {
        const size = particle.size + Math.sin(particle.pulsePhase) * 0.5;
        
        switch (particle.type) {
            case 'stars':
                this.drawStar(ctx, size, particle.color);
                break;
            case 'diamonds':
                this.drawDiamond(ctx, size, particle.color);
                break;
            case 'dots':
                this.drawDot(ctx, size, particle.color);
                break;
            case 'coins':
                this.drawCoin(ctx, size, particle.color);
                break;
            case 'hearts':
                this.drawHeart(ctx, size, particle.color);
                break;
            case 'squares':
                this.drawSquare(ctx, size, particle.color);
                break;
            default:
                this.drawDot(ctx, size, particle.color);
        }
    }
    
    drawStar(ctx, size, color) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        ctx.beginPath();
        ctx.fillStyle = color;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = size;
        ctx.fill();
    }
    
    drawDiamond(ctx, size, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        
        // Add inner highlight
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.moveTo(0, -size * 0.7);
        ctx.lineTo(size * 0.7, 0);
        ctx.lineTo(0, size * 0.7);
        ctx.lineTo(-size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
    }
    
    drawDot(ctx, size, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 2;
        ctx.fill();
    }
    
    drawCoin(ctx, size, color) {
        // Outer circle
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawHeart(ctx, size, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        
        const x = 0;
        const y = 0;
        const width = size * 2;
        const height = size * 2;
        
        ctx.moveTo(x, y + height / 4);
        ctx.quadraticCurveTo(x, y, x + width / 4, y);
        ctx.quadraticCurveTo(x + width / 2, y, x + width / 2, y + height / 4);
        ctx.quadraticCurveTo(x + width / 2, y, x + width * 3/4, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + height / 4);
        ctx.quadraticCurveTo(x + width, y + height / 2, x + width * 3/4, y + height * 3/4);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x + width / 4, y + height * 3/4);
        ctx.quadraticCurveTo(x, y + height / 2, x, y + height / 4);
        
        ctx.fill();
    }
    
    drawSquare(ctx, size, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(-size, -size, size * 2, size * 2);
        
        // Add border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-size, -size, size * 2, size * 2);
    }
    
    updateSection(sectionIndex) {
        this.currentSection = sectionIndex;
        
        // You can add section-specific particle behaviors here
        const sectionNames = ['hero', 'platform', 'workspace', 'benefits', 'apply', 'rules'];
        const currentSectionName = sectionNames[sectionIndex];
        
        if (currentSectionName && this.particles[currentSectionName]) {
            // Add special effects for current section
            this.addSectionEffects(currentSectionName);
        }
    }
    
    addSectionEffects(section) {
        const particles = this.particles[section];
        if (!particles) return;
        
        switch (section) {
            case 'hero':
                // Make particles move in a spiral
                particles.forEach(particle => {
                    particle.speedX += Math.sin(Date.now() * 0.001) * 0.1;
                    particle.speedY += Math.cos(Date.now() * 0.001) * 0.1;
                });
                break;
                
            case 'benefits':
                // Make coins spin faster
                particles.forEach(particle => {
                    if (particle.type === 'coins') {
                        particle.rotationSpeed *= 1.5;
                    }
                });
                break;
                
            case 'apply':
                // Make hearts pulse more
                particles.forEach(particle => {
                    if (particle.type === 'hearts') {
                        particle.pulseSpeed *= 2;
                    }
                });
                break;
        }
    }
    
    handleResize() {
        this.canvases.forEach((canvas, section) => {
            this.resizeCanvas(section);
            // Redistribute particles after resize
            const particles = this.particles[section];
            if (particles) {
                particles.forEach(particle => {
                    if (particle.x > canvas.width) particle.x = canvas.width;
                    if (particle.y > canvas.height) particle.y = canvas.height;
                });
            }
        });
    }
    
    bindEvents() {
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Pause particles when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    // Public methods for external control
    setParticleCount(section, count) {
        if (this.config[section]) {
            this.config[section].count = count;
            this.initParticles(section);
        }
    }
    
    setParticleSpeed(section, speed) {
        if (this.config[section]) {
            this.config[section].speed = speed;
            // Update existing particles
            const particles = this.particles[section];
            if (particles) {
                particles.forEach(particle => {
                    particle.speedX = this.randomBetween(-speed.max, speed.max);
                    particle.speedY = this.randomBetween(-speed.max, speed.max);
                });
            }
        }
    }
    
    addBurstEffect(section, x, y, count = 10) {
        const particles = this.particles[section];
        const config = this.config[section];
        const canvas = this.canvases.get(section);
        
        if (!particles || !config || !canvas) return;
        
        // Add temporary burst particles
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = this.randomBetween(2, 5);
            
            const burstParticle = {
                x: x,
                y: y,
                size: this.randomBetween(config.size.min, config.size.max),
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                opacity: 1,
                color: config.color,
                type: config.type,
                angle: angle,
                rotationSpeed: this.randomBetween(-0.1, 0.1),
                pulsePhase: 0,
                pulseSpeed: 0.05,
                life: 60, // frames
                maxLife: 60
            };
            
            particles.push(burstParticle);
        }
        
        // Remove burst particles after their life expires
        setTimeout(() => {
            this.particles[section] = particles.filter(p => !p.life || p.life > 0);
        }, 1000);
    }
    
    destroy() {
        this.stop();
        this.canvases.forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });
        this.canvases.clear();
        this.contexts.clear();
        this.particles = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}