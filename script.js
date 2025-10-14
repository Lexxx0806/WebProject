function calcPoints() {
  const gb = Math.max(0, Number(document.getElementById('gb').value) || 0);
  const stream = Math.max(0, Number(document.getElementById('stream').value) || 0);
  const email = Math.max(0, Number(document.getElementById('email').value) || 0);
  const dup = Math.max(0, Math.min(100, Number(document.getElementById('dup').value) || 0));
  const dupGb = gb * (dup/100);
  const points = Math.round(gb*2 + stream*3 + email*1 + dupGb*1.5);
  document.getElementById('points').textContent = points.toString();
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calc');
  if (btn) btn.addEventListener('click', calcPoints);
  calcPoints();
});
document.querySelectorAll('nav[aria-label="Main"] a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', link.getAttribute('href'));
    }
  });
});
