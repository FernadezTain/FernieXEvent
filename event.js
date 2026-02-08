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
// Добавьте эту функцию в ваш event.js
function createParticles() {
    const container = document.createElement('div');
    container.className = 'floating-particles';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 15 + 5;
        const posX = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 10 + 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `100%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = Math.random() * 0.6 + 0.1;
        
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
}

// Вызовите функцию в DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    // ... остальной ваш код
});
