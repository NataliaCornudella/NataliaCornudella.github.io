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
            // Force a reflow to ensure content is properly laid out
            informationContainer.offsetHeight;
        });

    // Check if we're on the projects page
    const isProjectsPage = window.location.pathname.includes('projects.html');

    if (infoButton) {
        infoButton.addEventListener('click', toggleInformationSection);
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
