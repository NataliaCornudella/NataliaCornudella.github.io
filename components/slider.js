document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const slider = document.getElementById('fullscreen-slider');
    const projectInfoNav = document.getElementById('project-info-nav');
    const sliderNavLeft = document.querySelector('.slider-nav-left');
    const sliderNavRight = document.querySelector('.slider-nav-right');

    let currentSlide = 0;
    let projects = [];
    let preloadedImages = {}; // Add this line to store preloaded images

    console.log('Fetching projects...');
    fetch('data/projects.json')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data.projects);
            projects = data.projects;
            preloadSliderImages(); // Add this line to preload images
            initializeSlider();
        })
        .catch(error => console.error('Error loading project data:', error));

    function preloadSliderImages() {
        projects.forEach((project, index) => {
            const img = new Image();
            img.src = project.mainImage;
            preloadedImages[index] = img;
        });
    }

    function initializeSlider() {
        console.log('Initializing slider');
        updateSlider();
        createProjectInfoWheel();
        updateProjectInfoNav();
        addProjectInfoListeners();

        addSwipeListeners(); // Initialize swipe detection

        const container = projectInfoNav.querySelector('.project-info-container');
        if (container) {
            container.addEventListener('scroll', () => {
                const scrollLeft = container.scrollLeft;
                const maxScrollLeft = container.scrollWidth / 2;

                if (scrollLeft >= maxScrollLeft) {
                    container.scrollLeft = scrollLeft - maxScrollLeft;
                } else if (scrollLeft <= 0) {
                    container.scrollLeft = scrollLeft + maxScrollLeft;
                }
            });
        } else {
            console.error('Container not found when trying to add scroll event listener.');
        }
    }

    function updateSlider() {
        console.log('Updating slider, current slide:', currentSlide);
        if (projects.length > 0) {
            const project = projects[currentSlide];
            slider.innerHTML = `
                <img src="${preloadedImages[currentSlide].src}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: contain;">
            `;
            preloadAdjacentImages();
        }
    }

    function preloadAdjacentImages() {
        const nextIndex = (currentSlide + 1) % projects.length;
        const prevIndex = (currentSlide - 1 + projects.length) % projects.length;
        [nextIndex, prevIndex].forEach(index => {
            if (!preloadedImages[index]) {
                const img = new Image();
                img.src = projects[index].mainImage;
                preloadedImages[index] = img;
            }
        });
    }

    function createProjectInfoWheel() {
        console.log('Creating project info wheel');
        const container = document.createElement('div');
        container.className = 'project-info-container';

        // Duplicate the projects to allow infinite scrolling
        const duplicateProjects = [...projects, ...projects];
        duplicateProjects.forEach((project, index) => {
            container.appendChild(createProjectInfoElement(project, index % projects.length));
        });

        projectInfoNav.innerHTML = '';
        projectInfoNav.appendChild(container);
    }

    function createProjectInfoElement(project, index) {
        const projectInfo = document.createElement('div');
        projectInfo.className = `project-info ${index === currentSlide ? 'active' : ''}`;
        projectInfo.dataset.id = project.id;
        projectInfo.innerHTML = `
            <div class="project-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="project-info-content">
                <div class="project-title">${project.title}</div>
                <div class="project-details">
                    <span class="project-client">${project.client}</span> / 
                    <span class="project-year">${project.year}</span>
                </div>
            </div>
        `;
        return projectInfo;
    }

    function addProjectInfoListeners() {
        console.log('Adding project info listeners');
        const projectInfos = projectInfoNav.querySelectorAll('.project-info');
        projectInfos.forEach((info, index) => {
            info.addEventListener('click', handleProjectInfoClick);
            info.addEventListener('mouseenter', () => handleProjectInfoHover(index));
            info.addEventListener('mouseleave', handleProjectInfoLeave);
        });
    }

    function handleProjectInfoClick(event) {
        console.log('Project info clicked');
        const projectId = event.currentTarget.dataset.id;
        if (projectId) {
            window.location.href = `project.html?id=${projectId}`;
        }
    }

    function handleProjectInfoHover(index) {
        console.log('Project info hovered, index:', index);
        const project = projects[index];
        const currentImage = slider.querySelector('img');
        if (currentImage) {
            currentImage.src = project.mainImage;
            currentImage.alt = project.title;
            currentImage.style.objectFit = 'contain';
        }
    }

    function handleProjectInfoLeave() {
        console.log('Project info mouse leave');
        updateSlider();
    }

    function updateProjectInfoNav() {
        const container = projectInfoNav.querySelector('.project-info-container');
        const projectInfos = container.querySelectorAll('.project-info');
        const gap = 20; // The gap between elements in pixels

        // Calculate the total width of a single set of projects
        let singleSetWidth = 0;
        for (let i = 0; i < projects.length; i++) {
            singleSetWidth += projectInfos[i].offsetWidth + gap;
        }

        // Update active class
        projectInfos.forEach((info, index) => {
            info.classList.toggle('active', index % projects.length === currentSlide);
        });

        // Calculate translateX for infinite scrolling
        let translateX = 0;
        for (let i = 0; i < currentSlide; i++) {
            translateX += projectInfos[i].offsetWidth + gap;
        }

        // Adjust translateX to create the looping effect
        if (translateX >= singleSetWidth) {
            translateX -= singleSetWidth;
        }

        container.style.transform = `translateX(-${translateX}px)`;
    }

    function moveSlider(direction) {
        currentSlide = (currentSlide + direction + projects.length) % projects.length;
        updateSlider();
        updateProjectInfoNav();
    }

    sliderNavLeft.addEventListener('click', () => moveSlider(-1));
    sliderNavRight.addEventListener('click', () => moveSlider(1));

    function addSwipeListeners() {
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', handleTouchStart, false);
        slider.addEventListener('touchend', handleTouchEnd, false);

        function handleTouchStart(event) {
            touchStartX = event.changedTouches[0].screenX;
        }

        function handleTouchEnd(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleGesture();
        }

        function handleGesture() {
            const swipeThreshold = 50; // Minimum required distance for a swipe

            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left (next slide)
                moveSlider(1);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right (previous slide)
                moveSlider(-1);
            }
        }
    }
});
