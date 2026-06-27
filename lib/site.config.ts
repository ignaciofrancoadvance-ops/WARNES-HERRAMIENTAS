/**
 * Configuración central de la landing.
 * Editá acá los textos, links e items. Las integraciones (WhatsApp / Calendly)
 * se leen de variables de entorno NEXT_PUBLIC_* (ver .env.example).
 */

export type GalleryItem = {
  type: "image" | "video";
  /** Ruta dentro de /public (ej: "/media/foto-1.jpg") */
  src: string;
  /** Poster para videos (opcional, ruta en /public) */
  poster?: string;
  alt: string;
  caption?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  /** Ruta del avatar en /public (opcional) */
  avatar?: string;
};

export type Faq = {
  q: string;
  a: string;
};

export type NavLink = { label: string; href: string };

// --- Integraciones ---
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";
const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
  "Hola Advance Group, quiero coordinar una llamada sobre importación.";

export const siteConfig = {
  brand: "Advance Group",
  unit: "Servicio Integral de Importación",
  domainEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "comex@advancegrouparg.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+54 9 11 0000-0000",

  whatsapp: {
    number: WHATSAPP_NUMBER,
    message: WHATSAPP_MESSAGE,
    /** Link wa.me listo para usar */
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE,
    )}`,
  },

  calendly: {
    url: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/advancegroup/30min",
  },

  nav: [
    { label: "Servicio", href: "#servicio" },
    { label: "Galería", href: "#galeria" },
    { label: "Testimonios", href: "#testimonios" },
    { label: "FAQ", href: "#faq" },
    { label: "Agendar", href: "#agendar" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "Advance Group · Comercio Exterior",
    title: "Servicio integral de importación",
    subtitle:
      "Gestionamos tu importación de punta a punta: origen, logística internacional, aduana y entrega final. Vos te enfocás en tu negocio, nosotros del resto.",
    primaryCta: { label: "Coordinar una llamada", href: "#agendar" },
    secondaryCta: { label: "Escribinos por WhatsApp", href: "" }, // se completa con whatsapp.href
    /**
     * Fondo del hero. type:
     *  - "gradient": gradiente de marca (default, funciona sin assets)
     *  - "image": imagen en /public (definí src)
     *  - "video": video en /public (definí src y opcional poster)
     */
    media: {
      type: "gradient" as "gradient" | "image" | "video",
      src: "/media/hero.mp4",
      poster: "/media/hero-poster.jpg",
    },
    stats: [
      { value: "+15", label: "años en comercio exterior" },
      { value: "+30", label: "países de origen" },
      { value: "100%", label: "gestión integral" },
    ],
  },

  service: {
    title: "Una sola gestión, todo el proceso",
    subtitle:
      "Te acompañamos en cada etapa de la importación para que sea simple, previsible y sin sorpresas.",
    steps: [
      {
        title: "Sourcing y origen",
        desc: "Búsqueda y validación de proveedores, negociación y control de calidad en origen.",
      },
      {
        title: "Logística internacional",
        desc: "Marítimo, aéreo y terrestre. Coordinación de embarques, seguros y tiempos.",
      },
      {
        title: "Gestión aduanera",
        desc: "Clasificación arancelaria, documentación y despacho con nuestro equipo de comex.",
      },
      {
        title: "Entrega y posventa",
        desc: "Distribución en destino y seguimiento total hasta que el producto llega a tu depósito.",
      },
    ],
  },

  gallery: {
    title: "Operaciones en imágenes",
    subtitle: "Embarques, logística y equipo en acción.",
    items: [
      { type: "image", src: "/media/gallery-1.jpg", alt: "Contenedores en puerto", caption: "Consolidado marítimo" },
      { type: "image", src: "/media/gallery-2.jpg", alt: "Carga aérea", caption: "Importación aérea express" },
      { type: "video", src: "/media/gallery-video-1.mp4", poster: "/media/gallery-2.jpg", alt: "Operación logística", caption: "Logística integral" },
      { type: "image", src: "/media/gallery-3.jpg", alt: "Depósito y distribución", caption: "Distribución en destino" },
      { type: "image", src: "/media/gallery-4.jpg", alt: "Equipo de comercio exterior", caption: "Nuestro equipo de comex" },
      { type: "image", src: "/media/gallery-5.jpg", alt: "Documentación aduanera", caption: "Gestión documental" },
    ] satisfies GalleryItem[],
  },

  testimonials: {
    title: "Lo que dicen nuestros clientes",
    subtitle: "Empresas que ya importan con nosotros.",
    items: [
      {
        quote:
          "Resolvieron una importación que teníamos trabada hacía meses. Profesionales y siempre disponibles.",
        author: "María González",
        role: "Gerente de Compras · Retail",
      },
      {
        quote:
          "La gestión integral nos sacó un peso enorme de encima. Tiempos claros y cero sorpresas en aduana.",
        author: "Javier Rodríguez",
        role: "Director · Importadora industrial",
      },
      {
        quote:
          "Acompañamiento real en cada paso. Es como tener un equipo de comex propio sin el costo fijo.",
        author: "Lucía Fernández",
        role: "Fundadora · E-commerce",
      },
    ] satisfies Testimonial[],
  },

  faq: {
    title: "Preguntas frecuentes",
    subtitle: "Lo que más nos consultan antes de empezar.",
    items: [
      {
        q: "¿Qué incluye el servicio integral de importación?",
        a: "Cubrimos todo el proceso: sourcing y validación de proveedores, negociación, logística internacional, seguros, gestión aduanera y entrega en destino. Una sola gestión, un solo interlocutor.",
      },
      {
        q: "¿Trabajan con cualquier tipo de producto?",
        a: "Trabajamos con la mayoría de los rubros. En la primera llamada evaluamos la posición arancelaria, los permisos necesarios y la viabilidad de tu importación.",
      },
      {
        q: "¿Cuánto tarda una importación?",
        a: "Depende del origen, el modo de transporte y el tipo de mercadería. Te damos un cronograma estimado desde el inicio y lo vamos actualizando en cada etapa.",
      },
      {
        q: "¿Cómo calculan los costos?",
        a: "Armamos un costeo detallado (FOB, flete, seguro, derechos, tasas e impuestos) antes de avanzar, para que sepas el costo final puesto en tu depósito.",
      },
      {
        q: "¿Cómo empezamos a trabajar juntos?",
        a: "Coordinás una llamada por Calendly o nos escribís por WhatsApp. Relevamos tu necesidad y te enviamos una propuesta sin compromiso.",
      },
    ] satisfies Faq[],
  },

  agendar: {
    title: "Coordinemos una llamada",
    subtitle:
      "Elegí el día y horario que mejor te quede. Hablamos de tu importación y te asesoramos sin compromiso.",
  },

  footer: {
    description:
      "Advance Group — Servicio integral de importación y comercio exterior.",
  },
};

export type SiteConfig = typeof siteConfig;
