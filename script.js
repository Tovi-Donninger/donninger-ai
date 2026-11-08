const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNav');
const toast = document.getElementById('toast');
let toastTimer;
menuToggle.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  primaryNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('[data-assessment]').forEach(button => button.addEventListener('click', () => {
  toast.textContent = `${button.dataset.assessment} is planned for the next build stage. The website foundation is ready; the questionnaire is coming next.`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}));
document.getElementById('year').textContent = new Date().getFullYear();
