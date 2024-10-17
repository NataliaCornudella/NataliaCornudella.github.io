document.addEventListener('DOMContentLoaded', () => {
    const projectSlider = document.getElementById('project-slider');
    const sliderNavLeft = document.querySelector('.slider-nav-left');
    const sliderNavRight = document.querySelector('.slider-nav-right');
    const slideCounter = document.getElementById('slide-counter');
    const slideCounterText = document.getElementById('slide-counter-text');
    const relatedProjects = document.getElementById('related-projects');
    const projectInfoNav = document.getElementById('project-info-nav');

    let currentSlide = 0;
    let project;
    let allProjects;
    let preloadedImages = {};

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    fetch('data/projects.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data.projects;
            project = allProjects.find(p => p.id === parseInt(projectId));
            if (project) {
                displayProject(project);
            } else {
                console.error('Project not found');
            }
        })
        .catch(error => console.error('Error loading project data:', error));

    function displayProject(project) {
        document.title = `${project.title} - Natalia Cornudella`;
        
        if (!project.slides) {
            project.slides = project.images.map(image => ({
                layout: 'single-contain',
                images: [image]
            }));
        }
        
        preloadProjectImages(project);
        updateProjectInfoNav(project, allProjects);
        updateSlider();
        updateSlideCounter();
    }

    function preloadProjectImages(project) {
        project.slides.forEach((slide, index) => {
            preloadedImages[index] = [];
            slide.images.forEach((imageSrc, imageIndex) => {
                const img = new Image();
                img.src = imageSrc;
                preloadedImages[index][imageIndex] = img;
            });
        });
    }

    function updateProjectInfoNav(currentProject, allProjects) {
        const container = document.createElement('div');
        container.className = 'project-info-container';

        const currentIndex = allProjects.findIndex(p => p.id === currentProject.id);
        const orderedProjects = [
            ...allProjects.slice(currentIndex),
            ...allProjects.slice(0, currentIndex)
        ];

        orderedProjects.forEach((project, index) => {
            const projectInfo = createProjectInfoElement(project, index === 0);
            container.appendChild(projectInfo);
        });

        projectInfoNav.innerHTML = '';
        projectInfoNav.appendChild(container);

        const projectInfos = projectInfoNav.querySelectorAll('.project-info');
        projectInfos.forEach(info => {
            info.addEventListener('click', handleProjectInfoClick);
        });

        projectInfoNav.classList.add('project-info-nav-gradient');
    }

    function createProjectInfoElement(project, isActive) {
        const projectInfo = document.createElement('div');
        projectInfo.className = `project-info ${isActive ? 'active' : ''}`;
        projectInfo.dataset.id = project.id;
        projectInfo.innerHTML = `
            <div class="project-number">${project.id.toString().padStart(2, '0')}</div>
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

    function handleProjectInfoClick(event) {
        const projectId = event.currentTarget.dataset.id;
        if (projectId) {
            window.location.href = `project.html?id=${projectId}`;
        }
    }

    function updateSlider() {
        const slide = project.slides[currentSlide];
        let slideHTML = '';
        const isMobile = window.innerWidth <= 768;

        switch (slide.layout) {
            case 'single-contain':
            case 'single-cover':
            case 'single-contain-with-margin':
                slideHTML = createSingleSlideHTML(slide);
                break;
            case 'double-split-right-cover':
            case 'double-split-left-cover':
                slideHTML = isMobile ? createMobileSplitSlideHTML(slide) : createDesktopSplitSlideHTML(slide);
                break;
        }
        projectSlider.innerHTML = slideHTML;
        preloadAdjacentSlides();
    }

    function preloadAdjacentSlides() {
        const indicesToPreload = [
            currentSlide + 1,
            currentSlide - 1
        ];

        indicesToPreload.forEach(index => {
            if (index >= 0 && index < project.slides.length && !preloadedImages[index]) {
                const slide = project.slides[index];
                preloadedImages[index] = [];
                slide.images.forEach((imageSrc, imageIndex) => {
                    const img = new Image();
                    img.src = imageSrc;
                    preloadedImages[index][imageIndex] = img;
                });
            }
        });
    }

    function createSingleSlideHTML(slide) {
        const img = preloadedImages[currentSlide][0];
        if (slide.layout === 'single-contain-with-margin') {
            return `<div class="contain-with-margin"><img src="${img.src}" alt="" class="${slide.layout}"></div>`;
        }
        return `<img src="${img.src}" alt="" class="${slide.layout}">`;
    }

    function createDesktopSplitSlideHTML(slide) {
        const isLeftCover = slide.layout === 'double-split-left-cover';
        const [img1, img2] = preloadedImages[currentSlide];
        return `
            <div class="split-slide">
                <div class="split-left">
                    <img src="${img1.src}" alt="" class="${isLeftCover ? 'cover-image' : 'contained-image'}">
                </div>
                <div class="split-right">
                    <img src="${img2.src}" alt="" class="${isLeftCover ? 'contained-image' : 'cover-image'}">
                </div>
            </div>
        `;
    }

    function createMobileSplitSlideHTML(slide) {
        const isBottomCover = slide.layout === 'double-split-left-cover';
        const [img1, img2] = preloadedImages[currentSlide];
        return `
            <div class="split-slide-mobile ${isBottomCover ? 'bottom-cover' : 'top-cover'}">
                <div class="split-top">
                    <img src="${isBottomCover ? img2.src : img1.src}" alt="" class="${isBottomCover ? 'contained-image' : 'cover-image'}">
                </div>
                <div class="split-bottom">
                    <img src="${isBottomCover ? img1.src : img2.src}" alt="" class="${isBottomCover ? 'cover-image' : 'contained-image'}">
                </div>
            </div>
        `;
    }

    function updateSlideCounter() {
        slideCounterText.textContent = `${currentSlide + 1} / ${project.slides.length}`;
    }

    function showRelatedProjects() {
        const randomProjects = getRandomProjects(allProjects, 4, project.id);
        relatedProjects.innerHTML = `
            <div class="project-grid">
                ${randomProjects.map(p => createProjectItem(p)).join('')}
            </div>
        `;
        relatedProjects.classList.remove('hidden');
    }

    function createProjectItem(project) {
        return `
            <div class="project-item" data-id="${project.id}">
                <div class="project-item-wrapper">
                    <div class="project-image-wrapper">
                        <img src="${project.mainImage}" alt="${project.title}">
                    </div>
                    <div class="project-info">
                        <div class="project-number">${project.id.toString().padStart(2, '0')}</div>
                        <div class="project-info-content">
                            <div class="project-title">${project.title}</div>
                            <div class="project-details">
                                <span class="project-client">${project.client}</span> / 
                                <span class="project-year">${project.year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getRandomProjects(projects, count, excludeId) {
        const filteredProjects = projects.filter(p => p.id !== excludeId);
        return filteredProjects.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    sliderNavLeft.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
            updateSlideCounter();
        }
    });

    sliderNavRight.addEventListener('click', () => {
        if (currentSlide < project.slides.length - 1) {
            currentSlide++;
            updateSlider();
            updateSlideCounter();
        } else {
            showRelatedProjects();
        }
    });

    relatedProjects.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-item');
        if (projectItem) {
            const projectId = projectItem.dataset.id;
            window.location.href = `project.html?id=${projectId}`;
        }
    });

    projectInfoNav.addEventListener('click', (e) => {
        const projectInfo = e.target.closest('.project-info');
        if (projectInfo) {
            const clickedProjectId = parseInt(projectInfo.dataset.id);
            if (clickedProjectId !== project.id) {
                window.location.href = `project.html?id=${clickedProjectId}`;
            }
        }
    });

    const projectInfoContainer = document.querySelector('.project-info-container.static');
    
    projectInfoContainer.addEventListener('mouseenter', () => {
        projectInfoContainer.style.overflowX = 'auto';
    });

    projectInfoContainer.addEventListener('mouseleave', () => {
        projectInfoContainer.style.overflowX = 'hidden';
    });
});
