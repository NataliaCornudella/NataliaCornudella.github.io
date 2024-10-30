document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-button');
    
    infoButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Force load all lazy images
        const lazyImages = document.querySelectorAll('img.lazy');
        const loadPromises = Array.from(lazyImages).map(img => {
            return new Promise((resolve) => {
                if (img.classList.contains('lazy')) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                } else {
                    resolve();
                }
            });
        });

        // Wait for all images to start loading
        await Promise.all(loadPromises);

        // Scroll to information section
        const informationSection = document.getElementById('information-section');
        informationSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
}); 