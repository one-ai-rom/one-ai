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

    const modal = document.getElementById('modal');
    const installModal = document.getElementById('installModal');
    const changelogModal = document.getElementById('changelogModal');

    const open2 = document.getElementById('openModal2');
    const close = document.getElementById('close');

    const installGuideBtn = document.getElementById('installGuide');
    const closeInstall = document.getElementById('closeInstall');

    const changelogBtn = document.getElementById('changelogBtn');
    const closeChangelog = document.getElementById('closeChangelog');

    if(open2) open2.addEventListener('click', () => showModal(modal));
    if(close) close.addEventListener('click', () => hideModal(modal));

    if(installGuideBtn) installGuideBtn.addEventListener('click', () => showModal(installModal));
    if(closeInstall) closeInstall.addEventListener('click', () => hideModal(installModal));

    if(changelogBtn) changelogBtn.addEventListener('click', () => showModal(changelogModal));
    if(closeChangelog) closeChangelog.addEventListener('click', () => hideModal(changelogModal));

    if(modal) modal.addEventListener('click', (e) => { if(e.target === modal) hideModal(modal); });
    if(installModal) installModal.addEventListener('click', (e) => { if(e.target === installModal) hideModal(installModal); });
    if(changelogModal) changelogModal.addEventListener('click', (e) => { if(e.target === changelogModal) hideModal(changelogModal); });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            if(modal && modal.classList.contains('show')) hideModal(modal);
            if(installModal && installModal.classList.contains('show')) hideModal(installModal);
            if(changelogModal && changelogModal.classList.contains('show')) hideModal(changelogModal);
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

            const loadPromise = new Promise((resolve, reject) => {
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = tempImg.src;
                    resolve({ index, img, naturalWidth: tempImg.naturalWidth, naturalHeight: tempImg.naturalHeight });
                };
                tempImg.onerror = () => {
                    img.src = 'https://via.placeholder.com/800x450?text=Preview+unavailable';
                    resolve({ index, img, naturalWidth: 800, naturalHeight: 450 });
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
            indicatorsContainer.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'grid';
            if (nextBtn) nextBtn.style.display = 'grid';
            indicatorsContainer.style.display = 'flex';
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

        const currentSlideElement = carouselTrack.children[currentSlide];
        if (!currentSlideElement) return;

        const currentImg = currentSlideElement.querySelector('img');
        if (!currentImg || !currentImg.naturalWidth) {
            setTimeout(adjustCarouselHeight, 100);
            return;
        }

        const naturalWidth = currentImg.naturalWidth;
        const naturalHeight = currentImg.naturalHeight;
        const containerWidth = carousel.clientWidth;
        const aspectRatio = naturalWidth / naturalHeight;

        let idealHeight = containerWidth / aspectRatio;

        const minHeight = 250;
        const maxByViewport = Math.max(350, Math.floor(window.innerHeight * 0.6));
        const maxAllowed = Math.min(500, maxByViewport);

        idealHeight = Math.max(minHeight, Math.min(idealHeight, maxAllowed));

        carousel.style.height = Math.round(idealHeight) + 'px';
    }

    function updateCarousel(){
        if (totalSlides === 0 || !carouselTrack) return;

        const translateX = -currentSlide * 100;
        carouselTrack.style.transform = `translateX(${translateX}%)`;

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });

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
        if (slideIndex < 0 || slideIndex >= totalSlides) return;
        currentSlide = slideIndex;
        updateCarousel();
    }

    function startAutoSlide() {
        if (totalSlides <= 1) return;
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    if(prevBtn) prevBtn.addEventListener('click', prevSlide);
    if(nextBtn) nextBtn.addEventListener('click', nextSlide);
    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowLeft') prevSlide();
        if(e.key === 'ArrowRight') nextSlide();
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if(targetContent) targetContent.classList.add('active');
        });
    });

    if (typeof ResizeObserver !== 'undefined' && carousel) {
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(window.carouselResizeTimeout);
            window.carouselResizeTimeout = setTimeout(adjustCarouselHeight, 150);
        });
        resizeObserver.observe(carousel);
    } else {
        window.addEventListener('resize', () => {
            clearTimeout(window.carouselResizeTimeout);
            window.carouselResizeTimeout = setTimeout(adjustCarouselHeight, 150);
        });
    }

    initializeCarousel();

    setTimeout(() => {
        if (isInitialized) {
            startAutoSlide();
        }
    }, 1000);

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
})();

(function(){
    const logoWrap = document.querySelector('.brand .logo');
    if (!logoWrap) return;

    const logoImg = logoWrap.querySelector('img');
    if (!logoImg) return;

    const easterEggImage = 'https://i.imgur.com/ENTi5Li.jpeg';
    const requiredClicks = 5;
    const windowMs = 1200;
    let clicks = [];

    const preload = (url) => {
        if (!url) return;
        const p = new Image();
        p.src = url;
    };
    preload(easterEggImage);

    let showingEgg = false;
    const originalSrc = logoImg.src;

    function attemptSwap() {
        const now = Date.now();
        clicks = clicks.filter(ts => now - ts <= windowMs);
        if (clicks.length >= requiredClicks) {
            clicks = [];
            toggleEgg();
        }
    }

    function toggleEgg(){
        const newSrc = showingEgg ? originalSrc : (easterEggImage || originalSrc);
        if (logoImg.src === newSrc) {
            showingEgg = !showingEgg;
            return;
        }

        logoImg.classList.add('fading');

        setTimeout(() => {
            logoImg.src = newSrc;
            void logoImg.offsetWidth;
            logoImg.classList.remove('fading');
            showingEgg = !showingEgg;
        }, 340);
    }

    logoWrap.addEventListener('click', (e) => {
        clicks.push(Date.now());
        if (clicks.length > requiredClicks) clicks.shift();
        attemptSwap();
    });

    logoWrap.setAttribute('tabindex', '0');
    logoWrap.style.cursor = 'pointer';
    logoWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') toggleEgg();
    });
    // my donation thingy
    const donateBtn = document.getElementById('donateBtn');
    const donateModal = document.getElementById('donateModal');
    const closeDonate = document.getElementById('closeDonate');
    
    if(donateBtn) donateBtn.addEventListener('click', () => showModal(donateModal));
    if(closeDonate) closeDonate.addEventListener('click', () => hideModal(donateModal));
    if(donateModal) donateModal.addEventListener('click', (e) => { if(e.target === donateModal) hideModal(donateModal); });
    
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            if(modal && modal.classList.contains('show')) hideModal(modal);
            if(installModal && installModal.classList.contains('show')) hideModal(installModal);
            if(changelogModal && changelogModal.classList.contains('show')) hideModal(changelogModal);
            if(donateModal && donateModal.classList.contains('show')) hideModal(donateModal); // Add this line
        }
    });

})();
