document.addEventListener('DOMContentLoaded', () => {
    // AOS Initialization
    AOS.init({
        duration: 1000, // values from 0 to 3000, with step 50ms
        once: true,     // whether animation should happen only once - while scrolling down
    });

    // Mobile Navbar Toggle
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            const isExpanded = hamburger.classList.contains("active");
            hamburger.setAttribute("aria-expanded", isExpanded.toString());
            document.body.style.overflow = isExpanded ? 'hidden' : ''; // Prevent scroll when mobile menu is open
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                if (navMenu.classList.contains("active")) {
                    hamburger.classList.remove("active");
                    navMenu.classList.remove("active");
                    hamburger.setAttribute("aria-expanded", "false");
                    document.body.style.overflow = ''; // Restore scroll
                }
            });
        });
    }

    // Back to Top Button
    const backToTopButton = document.getElementById("backToTopBtn");

    if (backToTopButton) {
        const scrollThreshold = 100; 

        function toggleBackToTopButton() {
            if (window.scrollY > scrollThreshold) {
                backToTopButton.classList.add("show");
            } else {
                backToTopButton.classList.remove("show");
            }
        }

        window.addEventListener("scroll", toggleBackToTopButton);
        toggleBackToTopButton(); 

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Active Nav Link highlighting on scroll
    const sections = document.querySelectorAll("main section[id]");
    const navHeaderLinks = document.querySelectorAll(".nav-menu a.nav-link");
    const navbar = document.querySelector('.navbar');

    function navHighlighter() {
        if (!sections.length || !navHeaderLinks.length || !navbar) return;

        let scrollY = window.pageYOffset;
        const navbarHeight = navbar.offsetHeight;
        let currentActiveSectionId = null;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - navbarHeight - 60;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentActiveSectionId = current.getAttribute("id");
            }
        });
        
        if (!currentActiveSectionId && (window.innerHeight + scrollY) >= document.body.offsetHeight - 20) {
            if (sections.length > 0) {
                currentActiveSectionId = sections[sections.length - 1].id;
            }
        }

        navHeaderLinks.forEach(link => {
            link.classList.remove("active");
            const linkHref = link.getAttribute("href");
            if (linkHref && currentActiveSectionId && linkHref.endsWith(`#${currentActiveSectionId}`)) {
                link.classList.add("active");
            }
        });
        
        if (!currentActiveSectionId && scrollY < (sections[0]?.offsetTop - navbarHeight - 60)) {
            const homeLink = document.querySelector('.nav-menu a[href="#home"]');
            if (homeLink) {
                navHeaderLinks.forEach(l => l.classList.remove('active')); 
                homeLink.classList.add('active');
            }
        } else if (!document.querySelector(".nav-menu a.nav-link.active") && scrollY < (sections[0]?.offsetTop - navbarHeight - 60)) {
            const homeLink = document.querySelector('.nav-menu a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }

    if (navbar && sections.length > 0 && navHeaderLinks.length > 0) {
        window.addEventListener("scroll", navHighlighter);
        navHighlighter(); 
    }

    // Contact Form Submission (redirects to mail client)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject'); 
            const messageInput = document.getElementById('message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput ? subjectInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (name && email && subject && message) {
                const mailtoEmail = 'newtownfootballforum@gmail.com'; 
                const mailtoSubject = encodeURIComponent(subject);
                const mailtoBody = encodeURIComponent(
                    `Dear Newtown Football Forum,\n\nMy name is ${name} (${email}).\n\nMessage:\n${message}\n\nRegards,\n${name}`
                );

                const mailtoLink = `mailto:${mailtoEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
                window.location.href = mailtoLink;
                
                setTimeout(() => {
                    contactForm.reset(); 
                }, 100); 

            } else {
                alert("Please fill in all fields (Name, Email, Subject, and Message).");
            }
        });
    }

    // --- Lightbox Gallery for Gallery Section ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let imagesData = [];
    let lastFocusedElement;

    if (galleryItems.length > 0 && lightboxModal && lightboxImage && lightboxCaption && lightboxClose && lightboxPrev && lightboxNext) {
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const overlaySpan = item.querySelector('.overlay span');

            if (img) {
                imagesData.push({
                    src: img.src,
                    alt: img.alt,
                    caption: overlaySpan ? overlaySpan.textContent : img.alt // Use overlay text or fallback to alt
                });

                // Already has tabindex="0" and role="button" in HTML
                item.setAttribute('aria-label', `View image: ${imagesData[index].caption}`);

                item.addEventListener('click', () => openLightbox(index));
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(index);
                    }
                });
            }
        });

        function openLightbox(index) {
            lastFocusedElement = document.activeElement;
            currentImageIndex = index;
            updateLightboxImage();
            lightboxModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            lightboxClose.focus(); // Focus on close button initially
        }

        function closeLightbox() {
            lightboxModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore body scroll
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }

        function updateLightboxImage() {
            if (imagesData[currentImageIndex]) {
                lightboxImage.src = imagesData[currentImageIndex].src;
                lightboxImage.alt = imagesData[currentImageIndex].alt;
                lightboxCaption.textContent = imagesData[currentImageIndex].caption;
            }
            lightboxPrev.style.display = (currentImageIndex === 0) ? 'none' : 'block';
            lightboxNext.style.display = (currentImageIndex === imagesData.length - 1) ? 'none' : 'block';
        }

        function showPrevImage() {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateLightboxImage();
                lightboxPrev.focus();
            }
        }

        function showNextImage() {
            if (currentImageIndex < imagesData.length - 1) {
                currentImageIndex++;
                updateLightboxImage();
                lightboxNext.focus();
            }
        }

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (lightboxModal.style.display === 'block') {
                if (e.key === 'Escape') closeLightbox();
                else if (e.key === 'ArrowLeft' && lightboxPrev.style.display !== 'none') showPrevImage();
                else if (e.key === 'ArrowRight' && lightboxNext.style.display !== 'none') showNextImage();
            }
        });

        // Close lightbox if backdrop is clicked
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

});