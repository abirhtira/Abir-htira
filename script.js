document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll(
      '.hero-copy, .portrait-card, .section-heading, .soc-detail, .expertise-card, .skill-card, ' +
      '.process-card, .tool-card, .timeline-item, .certificate-card, .contact-box, .architecture-box'
    );
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -32px 0px',
    });

    revealElements.forEach((element, index) => {
      element.dataset.reveal = '';
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 65}ms`);
      revealObserver.observe(element);
    });
  }

  const filters = document.querySelectorAll('[data-certificate-filter]');
  const certificates = document.querySelectorAll('[data-certificate-category]');
  const count = document.querySelector('[data-certificate-count]');

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.certificateFilter;
      let visibleCount = 0;

      filters.forEach((item) => {
        const isActive = item === filter;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      certificates.forEach((certificate) => {
        const isVisible = category === 'all' || certificate.dataset.certificateCategory === category;
        certificate.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'certificate' : 'certificates'}`;
      }
    });
  });
});
