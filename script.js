(function(){
    function showModal(modal) {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    const s21Modal = document.getElementById('s21Modal');
    const s21UModal = document.getElementById('s21UModal');
    const installModal = document.getElementById('installModal');
    const changelogModal = document.getElementById('changelogModal');
    const donateModal = document.getElementById('donateModal');

    function setupModal(modal, openBtn, closeBtn) {
        if(modal && openBtn && closeBtn) {
            openBtn.addEventListener('click', () => showModal(modal));
            closeBtn.addEventListener('click', () => hideModal(modal));
            modal.addEventListener('click', (e) => { 
                if(e.target === modal) hideModal(modal); 
            });
        }
    }
    
    setupModal(s21Modal, document.getElementById('openS21Modal'), document.getElementById('closeS21Modal'));
    
    setupModal(s21UModal, document.getElementById('openS21UModal'), document.getElementById('closeS21UModal'));

    setupModal(installModal, document.getElementById('installGuide'), document.getElementById('closeInstall'));
    
    setupModal(changelogModal, document.getElementById('changelogBtn'), document.getElementById('closeChangelog'));

    setupModal(donateModal, document.getElementById('donateBtn'), document.getElementById('closeDonate'));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(hideModal);
        }
    });

    const carouselImages = [
        { src: 'https://i.imgur.com/g0J8vV3.jpeg', alt: 'OneAI Screenshot 1' },
        { src: 'https://i.imgur.com/xymeNw6.jpeg', alt: 'OneAI Settings Screenshot' },
        { src: 'https://i.imgur.com/utXiMyt.jpeg', alt: 'OneAI Screenshot 3' },
        { src: 'https://i.imgur.com/1XXnpdk.jpeg', alt: 'OneAI Screenshot 4' },
        { src: 'https://i.imgur.com/ungWGYR.jpeg', alt: 'OneAI Screenshot 5' },
        { src: 'https://i.imgur.com/McEPGiA.jpeg', alt: 'OneAI Screenshot 6' },
    ];

    const carousel = document.getElementById('carousel');
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicators');

    let currentSlide = 0;
    let totalSlides = carouselImages.length;
    let indicators = [];
    let autoSlideInterval;
    let imageLoadPromises = [];
    let isInitialized = false;

    function initializeCarousel() {
        if (!carouselTrack || !indicatorsContainer) return;
        carouselTrack.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        indicators = [];
        imageLoadPromises = [];

        carouselImages.forEach((imageData, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const img = document.createElement('img');
            img.alt = imageData.alt || '';
            img.loading = 'lazy';

            const loadPromise = new Promise((resolve) => {
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = tempImg.src;
                    resolve();
                };
                tempImg.onerror = () => {
                    img.src = 'https://via.placeholder.com/800x450?text=Preview+unavailable';
                    resolve();
                };
                tempImg.src = imageData.src;
            });

            imageLoadPromises.push(loadPromise);

            slide.appendChild(img);
            carouselTrack.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.dataset.slide = index;
            dot.addEventListener('click', () => goToSlide(index));

            indicatorsContainer.appendChild(dot);
            indicators.push(dot);
        });

        totalSlides = carouselImages.length;

        if (totalSlides <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (indicatorsContainer) indicatorsContainer.style.display = 'none';
        }

        if (imageLoadPromises[0]) {
            imageLoadPromises[0].then(() => {
                isInitialized = true;
                adjustCarouselHeight();
            });
        }
    }

    function adjustCarouselHeight() {
        if (!carousel || totalSlides === 0 || !isInitialized) return;
        const currentImg = carouselTrack.children[currentSlide]?.querySelector('img');
        if (!currentImg || !currentImg.naturalWidth) return;
        
        const aspectRatio = currentImg.naturalWidth / currentImg.naturalHeight;
        let idealHeight = carousel.clientWidth / aspectRatio;

        const minHeight = 250;
        const maxAllowed = Math.min(500, Math.max(350, Math.floor(window.innerHeight * 0.6)));
        idealHeight = Math.max(minHeight, Math.min(idealHeight, maxAllowed));
        carousel.style.height = `${Math.round(idealHeight)}px`;
    }

    function updateCarousel(){
        if (totalSlides === 0 || !carouselTrack) return;
        carouselTrack.style.transform = `translateX(${-currentSlide * 100}%)`;
        indicators.forEach((indicator, index) => indicator.classList.toggle('active', index === currentSlide));
        adjustCarouselHeight();
    }

    function nextSlide(){
        if (totalSlides <= 1) return;
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide(){
        if (totalSlides <= 1) return;
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    function goToSlide(slideIndex){
        if (slideIndex >= 0 && slideIndex < totalSlides) {
            currentSlide = slideIndex;
            updateCarousel();
        }
    }
    
    function startAutoSlide() {
        if (totalSlides <= 1) return;
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    if (carousel) {
        initializeCarousel();
        if(prevBtn) prevBtn.addEventListener('click', prevSlide);
        if(nextBtn) nextBtn.addEventListener('click', nextSlide);
        document.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowLeft') prevSlide();
            if(e.key === 'ArrowRight') nextSlide();
        });
        
        new ResizeObserver(adjustCarouselHeight).observe(carousel);
        
        setTimeout(() => { if (isInitialized) startAutoSlide(); }, 1000);
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if(targetContent) targetContent.classList.add('active');
        });
    });

    const logoWrap = document.querySelector('.brand .logo');
    if (logoWrap) {
        const logoImg = logoWrap.querySelector('img');
        const easterEggImage = 'https://i.imgur.com/ENTi5Li.jpeg';
        let clicks = [];
        let showingEgg = false;
        const originalSrc = logoImg.src;
        new Image().src = easterEggImage;

        function toggleEgg() {
            const newSrc = showingEgg ? originalSrc : easterEggImage;
            logoImg.classList.add('fading');
            setTimeout(() => {
                logoImg.src = newSrc;
                logoImg.classList.remove('fading');
                showingEgg = !showingEgg;
            }, 340);
        }

        logoWrap.addEventListener('click', () => {
            const now = Date.now();
            clicks.push(now);
            clicks = clicks.filter(ts => now - ts <= 1200);
            if (clicks.length >= 5) {
                clicks = [];
                toggleEgg();
            }
        });
    }
})();