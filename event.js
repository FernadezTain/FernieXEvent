// Обновленный JavaScript с улучшенной анимацией
document.querySelectorAll('.rule-title').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const isOpen = content.classList.contains('active');
        
        // Закрываем все открытые элементы
        document.querySelectorAll('.rule-content.active').forEach(el => {
            el.classList.remove('active');
            el.previousElementSibling.classList.remove('active');
        });
        
        // Открываем/закрываем текущий элемент
        if (!isOpen) {
            button.classList.add('active');
            content.classList.add('active');
            
            // Анимация появления пунктов списка
            setTimeout(() => {
                const items = content.querySelectorAll('.rule-list li');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.1}s`;
                });
            }, 100);
        }
    });
});

// Добавляем эффект параллакса для карточек
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    cards.forEach((card, index) => {
        const speed = 0.02 + (index * 0.01);
        const x = (mouseX * speed * 100) - 50;
        const y = (mouseY * speed * 100) - 50;
        
        card.style.transform = `
            translateY(-8px)
            translateX(${x}px)
            translateY(${y}px)
        `;
    });
});

// Добавляем анимацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Анимация появления заголовка
    const header = document.querySelector('.header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(-30px)';
    
    setTimeout(() => {
        header.style.transition = 'opacity 1s ease, transform 1s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 300);
    
    // Анимация появления карточек
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transitionDelay = `${index * 0.2}s`;
        }, 500);
    });
});
