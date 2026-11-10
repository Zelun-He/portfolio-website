// A single glow as the footer name enters view; the resting color stays in CSS.
const wordmark = document.querySelector('.footer-wordmark');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (wordmark && !reducedMotion.matches && 'IntersectionObserver' in window) {
  const finish = () => {
    wordmark.classList.remove('is-burning');
    wordmark.style.removeProperty('animation-play-state');
    document.removeEventListener('visibilitychange', syncVisibility);
    reducedMotion.removeEventListener('change', onMotionChange);
    wordmark.removeEventListener('animationend', onAnimationEnd);
  };
  const syncVisibility = () => {
    wordmark.style.animationPlayState = document.hidden ? 'paused' : 'running';
  };
  const onMotionChange = () => {
    if (reducedMotion.matches) {
      observer.disconnect();
      finish();
    }
  };
  const onAnimationEnd = event => {
    if (event.animationName === 'footer-name-burn') finish();
  };
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35)) return;
    observer.disconnect();
    if (reducedMotion.matches) return;
    wordmark.addEventListener('animationend', onAnimationEnd);
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();
    wordmark.classList.add('is-burning');
  }, { threshold: 0.35 });

  reducedMotion.addEventListener('change', onMotionChange);
  observer.observe(wordmark);
}
