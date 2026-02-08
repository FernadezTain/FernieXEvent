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
// Эффект увеличения курсора при наведении на кнопки
const interactiveElements = document.querySelectorAll('button, a, .rule-title, .glass-btn');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        const blob = document.querySelector('.liquid-blob');
        if (blob) {
            blob.style.width = '200px';
            blob.style.height = '200px';
            blob.style.transition = 'width 0.3s, height 0.3s';
        }
    });
    
    el.addEventListener('mouseleave', () => {
        const blob = document.querySelector('.liquid-blob');
        if (blob) {
            blob.style.width = '150px';
            blob.style.height = '150px';
        }
    });
});
// Логика модального окна
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const copyBtn = document.getElementById('copyBtn');

    // Открыть (обязательно проверяем, существует ли кнопка)
    if (openBtn) {
        openBtn.onclick = (e) => {
            e.preventDefault(); // Чтобы не срабатывал переход по ссылке сразу
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Запрещаем скролл сайта под модалкой
        };
    }

    // Закрыть
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Возвращаем скролл
        };
    }

    // Копирование
    if (copyBtn) {
        copyBtn.onclick = () => {
            const text = document.getElementById('templateText').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = '✅ Скопировано!';
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            });
        };
    }
    
    // Закрытие по клику на серый фон вокруг окна
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };
});
