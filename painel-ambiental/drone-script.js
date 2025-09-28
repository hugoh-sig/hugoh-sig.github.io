// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeStoryMap();
    setupScrollAnimations();
    setupCounterAnimations();
});

// Initialize story map
function initializeStoryMap() {
    const mapElement = document.getElementById('storyMap');
    if (mapElement) {
        // Create a simple visual representation
        mapElement.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.8;"></i>
                <div style="text-align: center;">
                    <h4 style="margin-bottom: 0.5rem;">Território Quilombola</h4>
                    <p style="opacity: 0.8; font-size: 0.9rem;">380 hectares mapeados</p>
                    <p style="opacity: 0.8; font-size: 0.9rem;">12 famílias envolvidas</p>
                </div>
            </div>
        `;
    }
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate cards on scroll
    const cards = document.querySelectorAll('.service-card, .impact-card, .project-card, .tech-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Setup counter animations
function setupCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .metric-value');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Animate counter
function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasComma = text.includes(',');
    const hasCm = text.includes('cm');
    
    let finalValue;
    let suffix = '';
    
    if (hasCm) {
        finalValue = parseInt(text.replace('cm', ''));
        suffix = 'cm';
    } else if (hasComma) {
        finalValue = parseInt(text.replace(/[,+]/g, ''));
        suffix = hasPlus ? '+' : '';
    } else {
        finalValue = parseInt(text.replace('+', ''));
        suffix = hasPlus ? '+' : '';
    }
    
    if (isNaN(finalValue)) return;
    
    const duration = 2000;
    const steps = 60;
    const stepValue = finalValue / steps;
    let currentValue = 0;
    let step = 0;
    
    const timer = setInterval(() => {
        currentValue += stepValue;
        step++;
        
        if (step >= steps) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.round(currentValue);
        
        if (hasComma && displayValue >= 1000) {
            displayValue = displayValue.toLocaleString('pt-BR');
        }
        
        element.textContent = displayValue + suffix;
    }, duration / steps);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && heroVisual) {
        const rate = scrolled * -0.5;
        heroVisual.style.transform = `translateY(${rate}px)`;
    }
});

// Add hover effects to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const overlay = this.querySelector('.project-overlay');
        if (overlay) {
            overlay.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8))';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const overlay = this.querySelector('.project-overlay');
        if (overlay) {
            overlay.style.background = 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))';
        }
    });
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
});

// Add click animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
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
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
