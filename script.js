window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 1500);

  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.display = 'none';
  }, 2500);
});