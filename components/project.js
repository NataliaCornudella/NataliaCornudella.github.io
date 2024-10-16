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
        
        updateProjectInfoNav(project, allProjects);
        updateSlider();
        updateSlideCounter();
    }

    function updateProjectInfoNav(currentProject, allProjects) {
        const container = document.createElement('div');
        container.className = 'project-info-container';

        // Find the index of the current project
        const currentIndex = allProjects.findIndex(p => p.id === currentProject.id);

        // Create a circular array of projects starting from the current project
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

        // Add click event listeners
        const projectInfos = projectInfoNav.querySelectorAll('.project-info');
        projectInfos.forEach(info => {
            info.addEventListener('click', handleProjectInfoClick);
        });

        // Restore the gradient
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
                // These layouts remain unchanged for mobile
                slideHTML = createSingleSlideHTML(slide);
                break;
            case 'double-split-right-cover':
            case 'double-split-left-cover':
                slideHTML = isMobile ? createMobileSplitSlideHTML(slide) : createDesktopSplitSlideHTML(slide);
                break;
        }
        projectSlider.innerHTML = slideHTML;
        lazyLoadImages();
    }

    function createSingleSlideHTML(slide) {
        if (slide.layout === 'single-contain-with-margin') {
            return `<div class="contain-with-margin"><img data-src="${slide.images[0]}" alt="" class="lazy"></div>`;
        }
        return `<img data-src="${slide.images[0]}" alt="" class="${slide.layout} lazy">`;
    }

    function createDesktopSplitSlideHTML(slide) {
        const isLeftCover = slide.layout === 'double-split-left-cover';
        return `
            <div class="split-slide">
                <div class="split-left">
                    <img src="${slide.images[0]}" alt="" class="${isLeftCover ? 'cover-image' : 'contained-image'}">
                </div>
                <div class="split-right">
                    <img src="${slide.images[1]}" alt="" class="${isLeftCover ? 'contained-image' : 'cover-image'}">
                </div>
            </div>
        `;
    }

    function createMobileSplitSlideHTML(slide) {
        const isBottomCover = slide.layout === 'double-split-left-cover';
        return `
            <div class="split-slide-mobile ${isBottomCover ? 'bottom-cover' : 'top-cover'}">
                <div class="split-top">
                    <img src="${slide.images[isBottomCover ? 1 : 0]}" alt="" class="${isBottomCover ? 'contained-image' : 'cover-image'}">
                </div>
                <div class="split-bottom">
                    <img src="${slide.images[isBottomCover ? 0 : 1]}" alt="" class="${isBottomCover ? 'cover-image' : 'contained-image'}">
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

    function lazyLoadImages() {
        const images = document.querySelectorAll('img.lazy');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, options);

        images.forEach(img => imageObserver.observe(img));
    }
});
