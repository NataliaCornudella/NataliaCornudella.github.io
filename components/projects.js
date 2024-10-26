document.addEventListener('DOMContentLoaded', () => {
    const projectGrid = document.getElementById('project-grid');
    const variantButtons = document.querySelectorAll('.grid-variant-selector .variant-button');
    const variantButtonMobile = document.querySelector('.grid-variant-selector .variant-button-mobile');

    let projects = [];

    fetch('data/projects.json')
        .then(response => response.json())
        .then(data => {
            projects = data.projects;
            renderProjects();
        })
        .catch(error => console.error('Error loading project data:', error));

    function renderProjects() {
        if (!projectGrid) {
            console.error('Project grid not found');
            return;
        }

        projectGrid.innerHTML = projects.map((project, index) => createProjectItem(project, index)).join('');

        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.addEventListener('click', () => {
                const projectId = item.dataset.id;
                window.location.href = `project.html?id=${projectId}`;
            });
        });

        lazyLoadImages();
    }

    function createProjectItem(project, index) {
        return `
            <div class="project-item" data-id="${project.id}">
                <div class="project-item-wrapper">
                    <div class="project-image-wrapper">
                        <img data-src="${project.mainImage}" alt="${project.title}" class="lazy">
                    </div>
                    <div class="project-info">
                        <div class="project-number">${(index + 1).toString().padStart(2, '0')}</div>
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

    function applyVariant(variant) {
        if (!projectGrid) {
            console.error('Project grid not found');
            return;
        }

        projectGrid.className = `variant-${variant}`;

        const projectItems = projectGrid.querySelectorAll('.project-item');
        
        projectItems.forEach(item => {
            const imageWrapper = item.querySelector('.project-image-wrapper');
            const projectInfo = item.querySelector('.project-info');

            const transition = 'max-height 0.2s ease-in-out, padding 0.2s ease-in-out, margin 0.2s ease-in-out, opacity 0.2s ease-in-out';
            
            imageWrapper.style.transition = transition;
            projectInfo.style.transition = transition;

            if (variant === '2') {
                projectInfo.style.maxHeight = '0';
                projectInfo.style.padding = '0';
                projectInfo.style.margin = '0';
                imageWrapper.style.flexGrow = '1';
                imageWrapper.style.maxHeight = '100%';
            } else if (variant === '3') {
                imageWrapper.style.maxHeight = '0';
                imageWrapper.style.padding = '0';
                imageWrapper.style.margin = '0';
                projectInfo.style.maxHeight = '';
                projectInfo.style.padding = '';
                projectInfo.style.margin = '';
            } else {
                imageWrapper.style.flexGrow = '1';
                imageWrapper.style.maxHeight = '100%';
                imageWrapper.style.padding = '';
                imageWrapper.style.margin = '';
                projectInfo.style.maxHeight = '';
                projectInfo.style.padding = '';
                projectInfo.style.margin = '';
            }
        });
    }

    function handleMobileVariantClick() {
        let currentVariant = parseInt(variantButtonMobile.dataset.variant);
        currentVariant = currentVariant % 3 + 1;
        variantButtonMobile.dataset.variant = currentVariant;
        variantButtonMobile.textContent = currentVariant;
        applyVariant(currentVariant.toString());
    }

    variantButtons.forEach(button => {
        button.addEventListener('click', () => {
            const variant = button.dataset.variant;
            applyVariant(variant);
            variantButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    if (variantButtonMobile) {
        variantButtonMobile.addEventListener('click', handleMobileVariantClick);
    } else {
        console.error('Mobile variant button not found');
    }

    applyVariant('1');
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
