document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ЛОГИКА АККОРДЕОНА (Оставляем как было, работает отлично) ---
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
                // Анимация пунктов списка
                const items = content.querySelectorAll('li');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.05}s`;
                    // Небольшая задержка перед добавлением класса
                    setTimeout(() => item.classList.add('visible'), 50);
                });
            } else {
                content.querySelectorAll('li').forEach(li => li.classList.remove('visible'));
            }
        });
    });

    // --- 2. ЛОГИКА ЖИДКОГО КУРСОРА (LIQUID PHYSICS) ---
    
    const blob = document.querySelector('.liquid-blob');
    const flare = document.querySelector('.lens-flare');
    
    // Координаты мыши (целевые)
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Координаты элементов (текущие)
    let blobX = mouseX;
    let blobY = mouseY;
    let flareX = mouseX;
    let flareY = mouseY;
    
    // Слушаем движение мыши
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Эффект клика
    document.addEventListener('mousedown', () => document.body.classList.add('is-pressed'));
    document.addEventListener('mouseup', () => document.body.classList.remove('is-pressed'));

    // Функция линейной интерполяции (для плавности)
    const lerp = (start, end, factor) => start + (end - start) * factor;

    function animateCursor() {
        // Жидкость движется медленно (вязкость)
        // 0.08 = скорость (меньше = медленнее)
        blobX = lerp(blobX, mouseX, 0.08);
        blobY = lerp(blobY, mouseY, 0.08);
        
        // Блик движется быстрее (свет)
        flareX = lerp(flareX, mouseX, 0.2);
        flareY = lerp(flareY, mouseY, 0.2);
        
        // Применяем координаты
        if (blob) {
            blob.style.transform = `translate(${blobX}px, ${blobY}px) translate(-50%, -50%)`;
        }
        if (flare) {
            flare.style.transform = `translate(${flareX}px, ${flareY}px) translate(-50%, -50%)`;
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();

    // --- 3. ПАРАЛЛАКС КАРТОЧЕК (3D ЭФФЕКТ) ---
    // Легкий наклон карточек при движении мыши для усиления эффекта стекла
    const cards = document.querySelectorAll('.card');
    
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        cards.forEach(card => {
            // Сдвигаем карточку чуть-чуть
            card.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
        });
    });
    
    // Сброс позиции при уходе мыши
    document.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        });
    });
});
