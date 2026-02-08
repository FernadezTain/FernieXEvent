// Создаем плавающие частицы
function createParticles() {
    const container = document.createElement('div');
    container.className = 'floating-particles';
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайные параметры
        const size = Math.random() * 20 + 5;
        const posX = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 10 + 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `100%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Прозрачность
        particle.style.opacity = Math.random() * 0.6 + 0.1;
        
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
}

// Эффект преломления света при движении мыши
function createLightRefraction() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const refraction = document.createElement('div');
        refraction.className = 'light-refraction';
        card.appendChild(refraction);
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            refraction.style.setProperty('--mouse-x', `${x}%`);
            refraction.style.setProperty('--mouse-y', `${y}%`);
        });
        
        card.addEventListener('mouseleave', () => {
            refraction.style.opacity = '0';
        });
        
        card.addEventListener('mouseenter', () => {
            refraction.style.opacity = '1';
        });
    });
}

// Обработка аккордеона с жидкой анимацией
document.querySelectorAll('.rule-title').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const isOpen = content.classList.contains('active');
        
        // Закрываем все открытые элементы
        document.querySelectorAll('.rule-content.active').forEach(el => {
            el.classList.remove('active');
            el.previousElementSibling.classList.remove('active');
            
            // Очищаем анимации при закрытии
            const items = el.querySelectorAll('.rule-list li');
            items.forEach(item => {
                item.style.animation = '';
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
            });
        });
        
        // Открываем текущий элемент
        if (!isOpen) {
            button.classList.add('active');
            content.classList.add('active');
            
            // Жидкая анимация появления пунктов списка
            setTimeout(() => {
                const items = content.querySelectorAll('.rule-list li');
                items.forEach((item, index) => {
                    // Сбрасываем предыдущие анимации
                    item.style.animation = '';
                    
                    // Задержка для создания волнового эффекта
                    setTimeout(() => {
                        item.style.animation = `liquidAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards ${index * 0.05}s`;
                    }, 10);
                });
            }, 100);
        }
    });
});

// 3D эффект при наведении на карточки
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = (x - centerX) / 25;
        const rotateX = (centerY - y) / 25;
        
        card.style.transform = `
            translateY(-5px) 
            scale(1.01)
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
    });
});

// Плавное появление при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Создаем эффекты
    createParticles();
    createLightRefraction();
    
    // Запускаем анимации появления
    setTimeout(() => {
        document.querySelectorAll('.card, .header, .footer').forEach((el) => {
            el.style.opacity = '0';
        });
        
        // Включаем анимации через небольшой таймаут
        setTimeout(() => {
            document.querySelector('.header').style.animationPlayState = 'running';
            document.querySelectorAll('.card').forEach((card, index) => {
                card.style.animationDelay = `${0.4 + index * 0.1}s`;
                card.style.animationPlayState = 'running';
            });
            document.querySelector('.footer').style.animationPlayState = 'running';
        }, 100);
    }, 50);
});

// Динамическое изменение фона при прокрутке
let lastScrollY = window.scrollY;
let ticking = false;

function updateBackground() {
    const scrollY = window.scrollY;
    const intensity = Math.min(scrollY / 1000, 0.3);
    
    document.body.style.background = `
        linear-gradient(135deg, 
            rgba(15, 23, 42, ${0.8 + intensity}) 0%, 
            rgba(30, 41, 59, ${0.7 + intensity}) 50%, 
            rgba(51, 65, 85, ${0.6 + intensity}) 100%
        )
    `;
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateBackground);
        ticking = true;
    }
});

// Эффект пульсации для важных элементов
function addPulseEffect() {
    const importantCards = document.querySelectorAll('.card:nth-child(odd)');
    
    importantCards.forEach(card => {
        setInterval(() => {
            card.style.boxShadow = `
                0 30px 60px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 0 60px rgba(64, 156, 255, 0.4)
            `;
            
            setTimeout(() => {
                card.style.boxShadow = `
                    0 20px 40px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 0 40px rgba(64, 156, 255, 0.2)
                `;
            }, 1000);
        }, 5000);
    });
}

// Инициализация пульсации
setTimeout(addPulseEffect, 2000);

// Эффект мерцания для частиц
function twinkleParticles() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach(particle => {
        setInterval(() => {
            const brightness = Math.random() * 0.8 + 0.2;
            particle.style.opacity = brightness;
            
            // Случайное изменение размера
            if (Math.random() > 0.8) {
                const newSize = Math.random() * 15 + 5;
                particle.style.width = `${newSize}px`;
                particle.style.height = `${newSize}px`;
            }
        }, Math.random() * 2000 + 1000);
    });
}

// Запускаем мерцание
setTimeout(twinkleParticles, 1000);
