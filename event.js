// Обработка аккордеона
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
                item.classList.remove('visible');
                item.style.animation = '';
            });
        });
        
        // Открываем/закрываем текущий элемент
        if (!isOpen) {
            button.classList.add('active');
            content.classList.add('active');
            
            // Анимация появления пунктов списка с задержкой
            setTimeout(() => {
                const items = content.querySelectorAll('.rule-list li');
                items.forEach((item, index) => {
                    // Сбрасываем предыдущие анимации
                    item.style.animation = '';
                    item.classList.remove('visible');
                    
                    // Применяем новую анимацию с задержкой
                    setTimeout(() => {
                        item.style.animation = `slideInItem 0.5s forwards ${index * 0.05}s`;
                        item.classList.add('visible');
                    }, 10);
                });
            }, 100);
        }
    });
});

// Добавляем эффект параллакса для карточек (опционально)
let parallaxEnabled = false; // Можно установить в true, если нужен параллакс

if (parallaxEnabled) {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.card');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        cards.forEach((card, index) => {
            if (!card.classList.contains('hover')) { // Не применяем если карточка уже в состоянии hover
                const speed = 0.02 + (index * 0.01);
                const x = (mouseX * speed * 50);
                const y = (mouseY * speed * 50);
                
                card.style.transform = `
                    translateY(-4px)
                    translateX(${x}px)
                    translateY(${y}px)
                `;
            }
        });
    });
}

// Добавляем анимацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Плавное появление элементов
    setTimeout(() => {
        document.querySelectorAll('.card, .header, .footer').forEach((el, index) => {
            el.style.animation = `fadeInUp 0.8s ease ${index * 0.1}s forwards`;
        });
    }, 100);
    
    // Добавляем классы для плавного появления
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    });
    
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    header.style.opacity = '0';
    header.style.transform = 'translateY(20px)';
    footer.style.opacity = '0';
    footer.style.transform = 'translateY(20px)';
});

// Улучшаем hover эффекты для карточек
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
    });
});

// Дополнительный скрипт для плавной прокрутки
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
// Liquid Glass Cursor
const lens = document.querySelector('.lens');

document.addEventListener('mousemove', e => {
    lens.style.left = e.clientX + 'px';
    lens.style.top = e.clientY + 'px';
});

// Масштабирование и усиление blur при наведении на карточки
document.querySelectorAll('.card, .rule').forEach(el => {
    el.addEventListener('mouseenter', () => {
        lens.style.transform = 'translate(-50%, -50%) scale(1.5)';
        lens.style.backdropFilter = 'blur(16px) saturate(200%) brightness(1.3)';
    });
    el.addEventListener('mouseleave', () => {
        lens.style.transform = 'translate(-50%, -50%) scale(1)';
        lens.style.backdropFilter = 'blur(12px) saturate(180%) brightness(1.2)';
    });
});
