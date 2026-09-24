document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });

document.querySelectorAll('.section-heading, .project-card, .about-left, .about-right, .contact-panel').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

const filters = document.querySelectorAll('.project-filter');
const galleryCards = document.querySelectorAll('.gallery-card');
const filterStatus = document.getElementById('project-filter-status');

filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let visible = 0;
    galleryCards.forEach(card => {
      const matches = category === 'all' || card.dataset.categories.split(' ').includes(category);
      card.hidden = !matches;
      if (matches) visible++;
    });
    filterStatus.textContent = category === 'all'
      ? `Showing all ${visible} projects.`
      : `Showing ${visible} ${category === 'cpp' ? 'C++' : category} ${visible === 1 ? 'project' : 'projects'}.`;
  });
});
