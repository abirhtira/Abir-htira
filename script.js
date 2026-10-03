document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
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
