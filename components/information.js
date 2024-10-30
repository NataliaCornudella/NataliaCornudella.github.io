document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-button');
    const informationContainer = document.getElementById('information-container');
    const informationSection = document.getElementById('information-section');
    const main = document.querySelector('main');
    const projectInfoNav = document.getElementById('project-info-nav');

    // Load the information content
    fetch('components/information.html')
        .then(response => response.text())
        .then(html => {
            informationSection.innerHTML = html;
            informationContainer.offsetHeight; // Force reflow
        });

    // Check if we're on the projects page
    const isProjectsPage = document.body.classList.contains('projects-page');

    if (infoButton) {
        infoButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (isProjectsPage) {
                // Projects page specific behavior
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

                await Promise.all(loadPromises);
                informationSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Original behavior for other pages
                informationContainer.classList.toggle('visible');
                document.body.classList.toggle('info-open');
                updateElementPositions();
            }
        });
    }

    // Add event listener to the information container instead of the button
    informationContainer.addEventListener('click', (e) => {
        if (e.target.id === 'close-info-button') {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling up
            informationContainer.classList.remove('visible');
            document.body.classList.remove('info-open');
            updateElementPositions();
        }
    });

    // Function to toggle information section
    function toggleInformationSection(e) {
        e.preventDefault();
        if (!window.location.pathname.includes('projects.html')) {
            informationContainer.classList.toggle('visible');
            document.body.classList.toggle('info-open');
            updateElementPositions();
        }
    }

    // Function to update element positions
    function updateElementPositions() {
        requestAnimationFrame(() => {
            const isVisible = informationContainer.classList.contains('visible');
            const pushDistance = isVisible ? 
                Math.min(informationContainer.offsetHeight, window.innerHeight * 0.9) : 0;
            
            main.style.transform = `translateY(-${pushDistance}px)`;
            projectInfoNav.style.transform = `translateY(-${pushDistance}px)`;
        });
    }

    // Close information section when clicking outside
    document.addEventListener('click', (e) => {
        if (!window.location.pathname.includes('projects.html') && 
            informationContainer.classList.contains('visible') &&
            !informationContainer.contains(e.target) &&
            e.target !== infoButton) {
            toggleInformationSection(e);
        }
    });

    // Prevent slider interactions when information section is open
    main.addEventListener('click', (e) => {
        if (informationContainer.classList.contains('visible')) {
            e.stopPropagation();
            toggleInformationSection(e);
        }
    });
});
