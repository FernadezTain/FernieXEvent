document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. АККОРДЕОН (Работает везде, легкий код) ---
    document.querySelectorAll('.rule-title').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isOpen = content.classList.contains('active');
            
            // Закрываем другие
            document.querySelectorAll('.rule-content.active').forEach(el => {
                if (el !== content) {
                    el.classList.remove('active');
                    el.previousElementSibling.classList.remove('active');
                    el.querySelectorAll('li').forEach(li => li.classList.remove('visible'));
                }
            });
            
            // Тоггл текущего
            button.classList.toggle('active');
            content.classList.toggle('active');
            
            if (!isOpen) {
                const items = content.querySelectorAll('li');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.05}s`;
                    setTimeout(() => item.classList.add('visible'), 50);
                });
            } else {
                content.querySelectorAll('li').forEach(li => li.classList.remove('visible'));
            }
        });
    });

    // === ПРОВЕРКА НА МОБИЛЬНОЕ УСТРОЙСТВО ===
    // Если экран меньше 991px ИЛИ устройство имеет сенсорный экран (coarse pointer)
    const isMobile = window.matchMedia("(max-width: 991px)").matches || 
                     window.matchMedia("(hover: none)").matches;

    // --- 2. ТЯЖЕЛАЯ АНИМАЦИЯ (ТОЛЬКО ДЛЯ ПК) ---
    if (!isMobile) {
        
        // --- LIQUID CURSOR LOGIC ---
        const blob = document.querySelector('.liquid-blob');
        const flare = document.querySelector('.lens-flare');
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let blobX = mouseX, blobY = mouseY;
        let flareX = mouseX, flareY = mouseY;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // 3D Наклон карточек (Parallax)
            // Вычисляем только если мышь двигается, чтобы не грузить CPU в простое
            requestAnimationFrame(() => {
                const xForce = (window.innerWidth / 2 - e.clientX) / 60; // Меньше чувствительность
                const yForce = (window.innerHeight / 2 - e.clientY) / 60;
                
                document.querySelectorAll('.card').forEach(card => {
                    // Проверка, находится ли мышь над карточкой (оптимизация)
                    const rect = card.getBoundingClientRect();
                    if (mouseX > rect.left && mouseX < rect.right && 
                        mouseY > rect.top && mouseY < rect.bottom) {
                        card.style.transform = `perspective(1000px) rotateY(${xForce}deg) rotateX(${-yForce}deg)`;
                    } else {
                        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
                    }
                });
            });
        });

        document.addEventListener('mousedown', () => document.body.classList.add('is-pressed'));
        document.addEventListener('mouseup', () => document.body.classList.remove('is-pressed'));

        // Функция линейной интерполяции
        const lerp = (start, end, factor) => start + (end - start) * factor;

        // Главный цикл анимации курсора
        function animateCursor() {
            blobX = lerp(blobX, mouseX, 0.08);
            blobY = lerp(blobY, mouseY, 0.08);
            flareX = lerp(flareX, mouseX, 0.2);
            flareY = lerp(flareY, mouseY, 0.2);
            
            if (blob) blob.style.transform = `translate(${blobX}px, ${blobY}px) translate(-50%, -50%)`;
            if (flare) flare.style.transform = `translate(${flareX}px, ${flareY}px) translate(-50%, -50%)`;
            
            requestAnimationFrame(animateCursor);
        }
        
        animateCursor();
    }
});
