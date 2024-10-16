document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const infoButton = document.getElementById('info-button');
    const infoSection = document.getElementById('information-section');

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Optionally save the preference to localStorage
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    infoButton.addEventListener('click', (e) => {
        e.preventDefault();
        infoSection.scrollIntoView({ behavior: 'smooth' });
    });
});
