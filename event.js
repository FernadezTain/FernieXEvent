document.addEventListener('DOMContentLoaded', () => {
    
    // 1. АККОРДЕОН (Оптимизированный)
    const titles = document.querySelectorAll('.rule-title');
    
    titles.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isOpen = content.classList.contains('active');
            
            // Закрываем остальные
            document.querySelectorAll('.rule-content.active').forEach(openEl => {
                if (openEl !== content) {
                    openEl.classList.remove('active');
                    openEl.style.maxHeight = null;
                    openEl.previousElementSibling.classList.remove('active');
                }
            });
            
            // Переключаем текущий
            if (!isOpen) {
                content.classList.add('active');
                // Устанавливаем высоту динамически для плавности
                content.style.maxHeight = content.scrollHeight + "px";
                button.classList.add('active');
                
                // Анимация списка
                content.querySelectorAll('li').forEach((li, i) => {
                    setTimeout(() => li.classList.add('visible'), i * 50);
                });
            } else {
                content.classList.remove('active');
                content.style.maxHeight = null;
                button.classList.remove('active');
                content.querySelectorAll('li').forEach(li => li.classList.remove('visible'));
            }
        });
    });

    // 2. ПРОВЕРКА МОБИЛКИ
    const isMobile = window.innerWidth <= 991 || ('ontouchstart' in window);

    if (!isMobile) {
        // Логика курсора (только ПК)
        const blob = document.querySelector('.liquid-blob');
        const flare = document.querySelector('.lens-flare');
        let mX = 0, mY = 0, bX = 0, bY = 0;

        document.addEventListener('mousemove', (e) => {
            mX = e.clientX;
            mY = e.clientY;
        });

        function render() {
            bX += (mX - bX) * 0.1;
            bY += (mY - bY) * 0.1;
            
            if(blob) blob.style.transform = `translate(${bX}px, ${bY}px) translate(-50%, -50%)`;
            if(flare) flare.style.transform = `translate(${mX}px, ${mY}px) translate(-50%, -50%)`;
            
            requestAnimationFrame(render);
        }
        render();
    }
});
