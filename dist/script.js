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
