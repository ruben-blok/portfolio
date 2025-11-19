document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }));
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Navigation background change on scroll
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');
    
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Show/hide back to top button
    if (backToTop) {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });

  // Animate skill bars when they come into view
  const skillLevels = document.querySelectorAll('.skill-level');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillLevel = entry.target;
        const width = skillLevel.style.width;
        skillLevel.style.transform = 'scaleX(1)';
        skillLevel.style.transition = `width 2s ease-in-out`;
        skillLevel.style.width = width;
        skillLevel.classList.add('show');
        observer.unobserve(skillLevel);
      }
    });
  }, observerOptions);

  skillLevels.forEach(skillLevel => {
    observer.observe(skillLevel);
  });

  // Animate other elements when they come into view
  const animateElements = document.querySelectorAll('.animate-on-scroll, .section-header, .timeline-content, .skill-category, .project-card, .contact-info, .contact-form');
  
  const animateObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        animateObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(element => {
    animateObserver.observe(element);
  });

  // Contact form handling
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      // Basic validation
      if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Simulate form submission (in a real application, you would send this to a server)
      alert('Thank you for your message! I will get back to you soon.');
      
      // Reset form
      this.reset();
    });
  }

  // Add animation delay for staggered effects
  const addAnimationDelays = () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const skillCategories = document.querySelectorAll('.skill-category');
    const projectCards = document.querySelectorAll('.project-card');

    timelineItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.2}s`;
    });

    skillCategories.forEach((category, index) => {
      category.style.animationDelay = `${index * 0.15}s`;
    });

    projectCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.2}s`;
    });
  };

  // Initialize animation delays
  addAnimationDelays();

  // Add hover effects for project cards
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
  });

  // Add click effect for buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
      if (!this.classList.contains('btn-outline')) {
        let ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = e.offsetX + 'px';
        ripple.style.top = e.offsetY + 'px';
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });
  });

  // Add ripple effect styling dynamically
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      position: relative;
      overflow: hidden;
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Hamburger animation
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  }

  // Add active class to navigation links based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Add loading animation for initial page load
  window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) {
        heroTitle.style.animation = 'fadeInUp 0.8s ease forwards';
      }
    }, 100);
  });
});
