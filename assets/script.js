// Warnes Herramientas — interacciones de la landing

// Menú mobile
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Cerrar el menú al hacer clic en un enlace (mobile)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Formulario de contacto -> abre WhatsApp con la consulta lista
const WHATSAPP_NUMBER = '5491132003900';
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = (document.getElementById('nombre').value || '').trim();
    const contacto = (document.getElementById('email').value || '').trim();
    const mensaje = (document.getElementById('mensaje').value || '').trim();
    const texto =
      `Hola Warnes Herramientas, soy ${nombre || '(sin nombre)'}.` +
      (mensaje ? `\nConsulta: ${mensaje}` : '\nQuería hacer una consulta.') +
      (contacto ? `\nMe pueden contactar en: ${contacto}` : '');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener');
  });
}

// Año actual en el footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
