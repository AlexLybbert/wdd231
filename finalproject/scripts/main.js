import { initMobileMenu } from './modules/navigation.js';
import { storage } from './modules/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initStatsCounter();
    initScrollAnimations();
    trackVisit();
});

function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    if (stats.length === 0) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetCount = Number.parseInt(target.dataset.count || '0', 10);
                animateCount(target, targetCount);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateCount(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .vendor-card');
    
    if (animatedElements.length === 0) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

function trackVisit() {
    if (!document.querySelector('.hero')) {
        return;
    }

    const key = 'foodstead_lastVisit';
    const lastVisit = storage.get(key);
    const currentVisit = new Date().toISOString();

    if (lastVisit) {
        console.log(`Welcome back! Last visit: ${new Date(lastVisit).toLocaleDateString()}`);
    } else {
        console.log('Welcome to The Foodstead!');
    }

    storage.set(key, currentVisit);
}
