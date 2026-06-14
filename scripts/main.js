/**
 * Medical Coder Portfolio - Main Script
 * Handles data fetching, rendering, and all interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Force scroll to top on load/refresh (start at landing page)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  let portfolioData = null;


  // DOM Elements
  const navbar = document.getElementById('navbar');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.navbar__toggle');
  const backToTop = document.getElementById('back-to-top');

  // Preloader Logic
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
        showScrollRestoreNotification();
      }, 500); // Remove from DOM after transition
    } else {
      showScrollRestoreNotification();
    }
  }, 2200); // Wait for the 2s fill animation + slight buffer

  // Initialize
  init();

  async function init() {
    try {
      // Smooth scroll for anchor links using native behavior
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      const response = await fetch('content.json');
      if (!response.ok) throw new Error('Failed to load content');
      portfolioData = await response.json();
      
      renderContent();
      setupInteractions();
      
    } catch (error) {
      console.error('Error initializing portfolio:', error);
      // Fallback or error state could be handled here
    }
  }

  /* ===========================================
     RENDERING
     =========================================== */
  function renderContent() {
    const d = portfolioData;
    
    // Meta & Hero
    document.title = `${d.meta.name} | ${d.meta.title}`;
    document.getElementById('nav-name').textContent = d.meta.name;
    
    // Make specific words interactive in the headline
    let headlineHTML = d.hero.headline
      .replace('Clinical', '<span class="hover-word hover-word--clinical">Clinical</span>')
      .replace('Data', '<span class="hover-word hover-word--data">Data</span>');
    document.getElementById('hero-headline').innerHTML = headlineHTML;
    
    document.getElementById('hero-subtitle').textContent = d.hero.subtitle;
    
    const heroActions = document.getElementById('hero-actions');
    heroActions.innerHTML = `
      <a href="${d.hero.ctaPrimary.link}" class="btn btn--primary">${d.hero.ctaPrimary.text}</a>
      <a href="${d.hero.ctaSecondary.link}" class="btn btn--secondary">${d.hero.ctaSecondary.text}</a>
    `;

    // About
    if (d.about.image) {
      document.getElementById('about-image').src = d.about.image;
    }
    const aboutBio = document.getElementById('about-bio');
    aboutBio.innerHTML = d.about.bio.map(p => `<p>${p}</p>`).join('');
    
    const aboutStats = document.getElementById('about-stats');
    aboutStats.innerHTML = d.about.stats.map(stat => `
      <div class="about__stat">
        <div class="about__stat-value" data-target="${stat.value}">${stat.value}${stat.suffix}</div>
        <div class="about__stat-label">${stat.label}</div>
      </div>
    `).join('');

    // Skills
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = d.skills.map((category, index) => `
      <div class="skills__category card reveal ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'} delay-${(index%2)+1}">
        <div class="skills__category-header">
          <div class="icon-box">
            ${getIcon(category.icon)}
          </div>
          <h3 class="skills__category-title">${category.category}</h3>
        </div>
        <div class="skills__list">
          ${category.items.map(skill => {
            return `
              <div class="skill__item">
                <div class="skill__header">
                  <span class="skill__name">${skill.name}</span>
                  <span class="skill__level">${skill.level}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar__fill" style="width: 0%" data-width="${skill.level}%">
                    <div class="progress-bar__glow"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Projects
    renderProjects(d.projects);

    // Experience
    const expTimeline = document.getElementById('experience-timeline');
    const expItemsHTML = d.experience.map((exp, i) => `
      <div class="experience__item reveal delay-${(i%3)+1}">
        <div class="experience__dot"></div>
        <div class="experience__card card">
          <div class="experience__header">
            <div>
              <h3 class="experience__role">${exp.role}</h3>
              <div class="experience__company">${exp.company}</div>
            </div>
            <div class="experience__duration">${exp.duration}</div>
          </div>
          <div class="experience__achievements">
            ${exp.achievements.map(ach => `
              <div class="experience__achievement">${ach}</div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    expTimeline.innerHTML = `
      <div class="experience__timeline-fill"></div>
      ${expItemsHTML}
    `;

    // Testimonials
    renderTestimonials(d.testimonials);

    // Contact
    document.getElementById('contact-heading').textContent = d.contact.heading;
    document.getElementById('contact-desc').textContent = d.contact.description;
    
    const contactDetails = document.getElementById('contact-details');
    contactDetails.innerHTML = `
      <div class="contact__detail">
        <div class="contact__detail-icon icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <div>
          <div class="contact__detail-label">Email</div>
          <a href="mailto:${d.meta.email}" class="contact__detail-value">${d.meta.email}</a>
        </div>
      </div>
      <div class="contact__detail">
        <div class="contact__detail-icon icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </div>
        <div>
          <div class="contact__detail-label">Phone</div>
          <a href="tel:${d.meta.phone}" class="contact__detail-value">${d.meta.phone}</a>
        </div>
      </div>
      <div class="contact__detail">
        <div class="contact__detail-icon icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div>
          <div class="contact__detail-label">Location</div>
          <div class="contact__detail-value">${d.meta.location}</div>
        </div>
      </div>
    `;

    const contactSocials = document.getElementById('contact-socials');
    contactSocials.innerHTML = d.contact.socials.map(social => `
      <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="contact__social" aria-label="${social.platform}">
        ${getIcon(social.icon)}
      </a>
    `).join('');

    // Footer
    document.getElementById('footer-copyright').textContent = d.footer.copyright;
    document.getElementById('footer-links').innerHTML = d.footer.links.map(link => `
      <a href="${link.url}" class="footer__link">${link.text}</a>
    `).join('');
  }

  function renderProjects(projects) {
    const filtersContainer = document.getElementById('projects-filters');
    const gridContainer = document.getElementById('projects-grid');
    
    // Extract unique categories
    const categories = ['All', ...new Set(projects.map(p => p.category))];
    
    filtersContainer.innerHTML = categories.map(cat => `
      <button class="projects__filter ${cat === 'All' ? 'active' : ''}" data-filter="${cat}">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    gridContainer.innerHTML = projects.map((p, i) => `
      <div class="project-card reveal delay-${(i%3)+1} ${p.featured ? 'featured' : ''}" data-category="${p.category}">
        <div class="project-card__image">
          <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&q=80&w=600'">
          <div class="project-card__overlay">
            <a href="${p.liveUrl}" class="btn btn--primary">View Details</a>
            ${p.sourceUrl !== '#' ? `<a href="${p.sourceUrl}" class="btn btn--secondary" style="color:white; border-color:white;">Source</a>` : ''}
          </div>
        </div>
        <div class="project-card__body">
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__desc">${p.description}</p>
          <div class="project-card__tags">
            ${p.tags.map(tag => `<span class="badge badge--slate">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Filter Logic
    const filterBtns = document.querySelectorAll('.projects__filter');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          if (filterValue === 'All' || card.getAttribute('data-category') === filterValue) {
            card.classList.remove('hidden');
            // Retrigger animation
            card.classList.remove('revealed');
            setTimeout(() => card.classList.add('revealed'), 50);
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  function renderTestimonials(testimonials) {
    const track = document.getElementById('testimonials-track');
    const dotsContainer = document.getElementById('testimonials-dots');
    
    track.innerHTML = testimonials.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-card__inner">
          <svg class="testimonial-card__quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
          <p class="testimonial-card__text">"${t.quote}"</p>
          <div class="testimonial-card__author">
            ${t.avatar ? `<div class="avatar avatar--lg"><img src="${t.avatar}" alt="${t.name}"></div>` : `<div class="avatar avatar--lg">${t.name.charAt(0)}</div>`}
            <div class="testimonial-card__info">
              <div class="testimonial-card__name">${t.name}</div>
              <div class="testimonial-card__role">${t.title}, ${t.company}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    dotsContainer.innerHTML = testimonials.map((_, i) => `
      <button class="testimonials__dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i+1}"></button>
    `).join('');

    setupCarousel(testimonials.length);
  }

  /* ===========================================
     INTERACTIONS & LOGIC
     =========================================== */
  function setupInteractions() {
    setupNavigation();
    setupScrollReveal();
    setupFormValidation();
    setupIVTimeline();
    setupAboutScrollAnimation();
    setupHoverEffects();
  }

  function setupNavigation() {
    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    function openMenu() {
      mobileMenu.classList.add('open');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    // Close menu on link click
    document.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Navbar Scroll Effect, Back to Top, & Save Scroll Position
    let saveScrollTimeout;
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }

      // Save scroll position for refresh resume
      clearTimeout(saveScrollTimeout);
      saveScrollTimeout = setTimeout(() => {
        if (window.scrollY <= 150) {
          sessionStorage.removeItem('portfolio_scroll_pos');
        } else {
          sessionStorage.setItem('portfolio_scroll_pos', window.scrollY);
        }
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Active Section Tracking
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__link');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -80% 0px' });

    sections.forEach(section => sectionObserver.observe(section));
  }

  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Trigger progress bars if they exist in this element
          const progressBars = entry.target.querySelectorAll('.progress-bar__fill');
          progressBars.forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
          });

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  function setupCarousel(totalSlides) {
    let currentSlide = 0;
    const track = document.getElementById('testimonials-track');
    const dots = document.querySelectorAll('.testimonials__dot');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    let autoPlayInterval;

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides; // Wrap around
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      dots.forEach(d => d.classList.remove('active'));
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetAutoPlay();
      });
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      clearInterval(autoPlayInterval);
    }, { passive: true });
    
    track.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) nextSlide();
      if (touchEndX > touchStartX + 50) prevSlide();
    }

    // Autoplay
    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    track.parentElement.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

  function setupFormValidation() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('contact-success');
    const resetBtn = document.getElementById('form-reset');
    const submitBtn = document.querySelector('.contact__submit');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      let isValid = true;
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        const errorEl = input.nextElementSibling;
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          isValid = false;
          input.classList.add('error');
          if (errorEl) {
            errorEl.textContent = 'Please enter a valid email address.';
            errorEl.classList.add('visible');
          }
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      if (!isValid) {
        e.preventDefault(); // Prevent default if invalid
      } else {
        e.preventDefault(); // Also prevent default if valid to use AJAX
        submitBtn.classList.add('loading');
        
        // Use FormData to capture all inputs
        const formData = new FormData(form);
        
        fetch('https://formsubmit.co/ajax/vanajakunuri685@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            form.style.display = 'none';
            successMsg.classList.add('visible');
            submitBtn.classList.remove('loading');
            form.reset();
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            submitBtn.classList.remove('loading');
            alert('There was a problem sending your message. Please try again later.');
        });
      }
    });

    // Clear error on input
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorEl = input.nextElementSibling;
        if (errorEl) errorEl.classList.remove('visible');
      });
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successMsg.classList.remove('visible');
    });
  }

  function setupAboutScrollAnimation() {
    const section = document.getElementById('about');
    if (!section) return;

    function updateAboutProgress() {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      let progress = 0;
      if (rect.top <= 0) {
        progress = -rect.top / (rect.height - windowHeight);
      }
      progress = Math.max(0, Math.min(1, progress));
      
      // Phase 1 (0 to 0.5) scaled to 0-1
      let p1 = Math.min(1, progress * 2);
      // Phase 2 (0.5 to 1) scaled to 0-1
      let p2 = Math.max(0, (progress - 0.5) * 2);
      
      section.style.setProperty('--about-p1', p1);
      section.style.setProperty('--about-p2', p2);
    }

    window.addEventListener('scroll', updateAboutProgress, { passive: true });
    window.addEventListener('resize', updateAboutProgress, { passive: true });
    
    // Initial calculation
    setTimeout(updateAboutProgress, 100);
  }

  function setupIVTimeline() {
    const timeline = document.getElementById('experience-timeline');
    if (!timeline) return;

    function updateIVFill() {
      const rect = timeline.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Calculate progress of the timeline in the viewport.
      // Starts when the top of the timeline is 65% down the screen,
      // and completes when the bottom of the timeline is 35% down the screen.
      const startTrigger = viewHeight * 0.65;
      const endTrigger = viewHeight * 0.35;
      
      const timelineTop = rect.top;
      const timelineHeight = rect.height;
      
      // Distance from the start trigger to the top of the timeline
      const currentScroll = startTrigger - timelineTop;
      
      // Calculate fill progress
      let progress = currentScroll / timelineHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      timeline.style.setProperty('--iv-fill', `${progress * 100}%`);
      
      // Activate dots (blood droplets) when the fill has crossed their center
      const dots = timeline.querySelectorAll('.experience__dot');
      const fillHeightPx = progress * timelineHeight;
      
      dots.forEach(dot => {
        const item = dot.closest('.experience__item');
        if (item) {
          // Calculate dot's center vertical position relative to the timeline container
          // The dot is 20px tall, so its center is offsetTop + 10px.
          const dotCenter = item.offsetTop + dot.offsetTop + 10;
          // Fill dot and trigger glow once blood fill crosses the center
          if (fillHeightPx >= dotCenter) {
            dot.classList.add('filled');
          } else {
            dot.classList.remove('filled');
          }
        }
      });
    }

    // Run on scroll and resize
    window.addEventListener('scroll', updateIVFill, { passive: true });
    window.addEventListener('resize', updateIVFill, { passive: true });
    
    // Initial calculation (delayed slightly for rendering to stabilize)
    setTimeout(updateIVFill, 300);
  }

  function setupHoverEffects() {
    const clinicalWord = document.querySelector('.hover-word--clinical');
    const dataWord = document.querySelector('.hover-word--data');

    const spawnParticles = (target, type) => {
      const rect = target.getBoundingClientRect();
      const numParticles = Math.floor(Math.random() * 5) + 8; // 8-12 particles
      
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = `particle particle--${type}`;
        
        // Randomize content for data, or use fixed for clinical
        if (type === 'data') {
          const chars = ['0', '1', '{', '}', ';', '/', '<', '>'];
          particle.textContent = chars[Math.floor(Math.random() * chars.length)];
        } else {
          particle.textContent = '+';
        }

        // Randomize starting position around the word
        const offsetX = (Math.random() - 0.5) * rect.width;
        const offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
        particle.style.top = `${rect.top + window.scrollY + offsetY}px`;
        
        // Randomize animation variables
        particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 150}px`);
        particle.style.setProperty('--ty', `${-80 - Math.random() * 80}px`);
        particle.style.setProperty('--r', `${(Math.random() - 0.5) * 720}deg`);
        particle.style.setProperty('--duration', `${2.5 + Math.random() * 1.5}s`);

        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
          particle.remove();
        }, 4500);
      }
    };

    let clinicalTimer = 0;
    if (clinicalWord) {
      clinicalWord.addEventListener('mouseenter', (e) => {
        const now = Date.now();
        if (now - clinicalTimer > 2000) {
          clinicalTimer = now;
          spawnParticles(e.target, 'clinical');
        }
      });
      // Fallback for touch devices
      clinicalWord.addEventListener('touchstart', (e) => {
        const now = Date.now();
        if (now - clinicalTimer > 2000) {
          clinicalTimer = now;
          spawnParticles(e.target, 'clinical');
        }
      }, {passive: true});
    }

    let dataTimer = 0;
    if (dataWord) {
      dataWord.addEventListener('mouseenter', (e) => {
        const now = Date.now();
        if (now - dataTimer > 2000) {
          dataTimer = now;
          spawnParticles(e.target, 'data');
        }
      });
      dataWord.addEventListener('touchstart', (e) => {
        const now = Date.now();
        if (now - dataTimer > 2000) {
          dataTimer = now;
          spawnParticles(e.target, 'data');
        }
      }, {passive: true});
    }
  }

  function showScrollRestoreNotification() {
    const savedPos = sessionStorage.getItem('portfolio_scroll_pos');
    if (!savedPos || parseInt(savedPos) <= 200) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'scroll-toast';
    toast.innerHTML = `
      <div class="scroll-toast__content">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="scroll-toast__icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>Continue where you left off?</span>
      </div>
      <div class="scroll-toast__actions">
        <button class="scroll-toast__btn scroll-toast__btn--resume">Resume</button>
        <button class="scroll-toast__btn scroll-toast__btn--dismiss" aria-label="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('visible'), 100);

    const resumeBtn = toast.querySelector('.scroll-toast__btn--resume');
    const dismissBtn = toast.querySelector('.scroll-toast__btn--dismiss');

    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
      window.removeEventListener('scroll', onManualScroll);
    };

    resumeBtn.addEventListener('click', () => {
      window.scrollTo({
        top: parseInt(savedPos),
        behavior: 'smooth'
      });
      dismiss();
    });

    dismissBtn.addEventListener('click', dismiss);

    // Auto dismiss after 8 seconds
    const autoDismissTimeout = setTimeout(dismiss, 8000);

    // Dismiss if user scrolls manually
    function onManualScroll() {
      if (Math.abs(window.scrollY) > 100) {
        clearTimeout(autoDismissTimeout);
        dismiss();
      }
    }

    // Delay scroll listener slightly to avoid triggering from loading scroll force
    setTimeout(() => {
      window.addEventListener('scroll', onManualScroll, { passive: true });
    }, 1000);
  }

  /* ===========================================
     UTILITIES
     =========================================== */
  function getIcon(name) {
    const icons = {
      code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      chart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      shield: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      tool: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
      linkedin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
      mail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      award: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>'
    };
    return icons[name] || icons.code;
  }
});
