document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЛОГИКА МОДАЛЬНОГО ОКНА ---
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const copyBtn = document.getElementById('copyBtn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Убираем скролл фона
        });
    }

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем скролл
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Закрытие по клику на область вне окна
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- 2. КОПИРОВАНИЕ ТЕКСТА ---
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('templateText').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = '✅ Скопировано!';
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            });
        });
    }

    // --- 3. КАСТОМНЫЙ КУРСОР (ДВИЖЕНИЕ И РЕАКЦИЯ) ---
    const blob = document.querySelector('.liquid-blob');
    const flare = document.querySelector('.lens-flare');

    if (window.innerWidth > 991) { // Только для ПК
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            // Плавное следование
            blob.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, { duration: 400, fill: "forwards" });

            flare.style.left = `${clientX}px`;
            flare.style.top = `${clientY}px`;
        });

        // Реакция курсора на наведение на кнопки
        const interactives = document.querySelectorAll('button, a, .rule-title');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                blob.style.width = '200px';
                blob.style.height = '200px';
            });
            el.addEventListener('mouseleave', () => {
                blob.style.width = '150px';
                blob.style.height = '150px';
            });
        });
    }

    // --- 4. АККОРДЕОН (ПРАВИЛА) ---
    const ruleTitles = document.querySelectorAll('.rule-title');
    ruleTitles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            const items = content.querySelectorAll('li');
            
            content.classList.toggle('active');
            
            if (content.classList.contains('active')) {
                items.forEach((item, index) => {
                    setTimeout(() => item.classList.add('visible'), index * 100);
                });
            } else {
                items.forEach(item => item.classList.remove('visible'));
            }
        });
    });
});
