document.addEventListener('DOMContentLoaded', () => {
// 1. ПЕРЕМЕННЫЕ
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const copyBtn = document.getElementById('copyBtn');
    const blob = document.querySelector('.liquid-blob');
    const flare = document.querySelector('.lens-flare');

    // 2. МОДАЛЬНОЕ ОКНО
    if (openBtn && modal) {
        openBtn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'flex'; // Гарантируем видимость
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 400); // Плавное исчезновение
            document.body.style.overflow = '';
        };
        if (closeBtn) closeBtn.onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
    }

    // 3. КОПИРОВАНИЕ
    if (copyBtn) {
        copyBtn.onclick = () => {
            const text = document.getElementById('templateText').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const original = copyBtn.innerText;
                copyBtn.innerText = '✅ Скопировано!';
                setTimeout(() => copyBtn.innerText = original, 2000);
            });
        };
    }

    // 4. КУРСОР И АККОРДЕОН (ОБЪЕДИНЕНО)
    if (window.innerWidth > 991 && blob) {
        window.onmousemove = (e) => {
            blob.animate({ left: e.clientX + 'px', top: e.clientY + 'px' }, { duration: 450, fill: "forwards" });
            flare.style.left = e.clientX + 'px';
            flare.style.top = e.clientY + 'px';
        };

        document.querySelectorAll('button, a, .rule-title').forEach(el => {
            el.onmouseenter = () => { blob.style.width = '200px'; blob.style.height = '200px'; };
            el.onmouseleave = () => { blob.style.width = '150px'; blob.style.height = '150px'; };
        });
    }

    document.querySelectorAll('.rule-title').forEach(title => {
        title.onclick = () => {
            const content = title.nextElementSibling;
            content.classList.toggle('active');
            content.querySelectorAll('li').forEach((li, i) => {
                if (content.classList.contains('active')) {
                    setTimeout(() => li.classList.add('visible'), i * 100);
                } else {
                    li.classList.remove('visible');
                }
            });
        };
    });
});


// 4. АККОРДЕОН (С авто-закрытием и улучшенной анимацией)
document.querySelectorAll('.rule-title').forEach(title => {
    title.onclick = () => {
        const parent = title.parentElement;
        const content = title.nextElementSibling;
        const isOpen = content.classList.contains('active');

        // Закрываем все открытые пункты
        document.querySelectorAll('.rule-content').forEach(el => {
            el.classList.remove('active');
            el.querySelectorAll('li').forEach(li => li.classList.remove('visible'));
        });

        // Если нажатый пункт не был открыт — открываем его
        if (!isOpen) {
            content.classList.add('active');
            // Анимация появления списка с задержкой
            content.querySelectorAll('li').forEach((li, i) => {
                setTimeout(() => li.classList.add('visible'), 150 + (i * 80));
            });
        }
    };
});
