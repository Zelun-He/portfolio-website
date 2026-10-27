// Resolve the shareable world choice before the first paint.
(() => {
  const isMagikarp = new URLSearchParams(window.location.search).get('world') === 'magikarp';
  document.documentElement.dataset.world = isMagikarp ? 'magikarp' : 'forest';
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (isMagikarp && themeColor) themeColor.content = '#b74136';
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = isMagikarp ? 'Images/magikarp-coast.webp' : 'hero-forest-sanctuary.webp';
  preload.fetchPriority = 'high';
  document.head.append(preload);
})();
