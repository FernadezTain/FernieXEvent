document.querySelectorAll('.rule-title').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const isOpen = content.style.display === 'block';

        document.querySelectorAll('.rule-content').forEach(el => {
            el.style.display = 'none';
        });

        content.style.display = isOpen ? 'none' : 'block';
    });
});
