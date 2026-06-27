import { siteConfig } from "@/lib/site.config";

export function Hero() {
  const { hero, whatsapp } = siteConfig;
  const media = hero.media;

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-brand-navyDark"
    >
      {/* Fondo */}
      <div className="absolute inset-0 -z-10">
        {media.type === "video" && (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={media.poster}
          >
            <source src={media.src} type="video/mp4" />
          </video>
        )}
        {media.type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.src} alt="" className="h-full w-full object-cover" />
        )}
        {media.type === "gradient" && (
          <div className="h-full w-full bg-gradient-to-br from-brand-navyDark via-brand-navy to-brand-steel" />
        )}

        {/* Capa gráfica de marca (rutas + pirámide), visible sobre todo en gradiente */}
        <HeroGraphics />

        {/* Overlays para contraste del texto */}
        <div className="absolute inset-0 bg-brand-navyDark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navyDark via-brand-navyDark/30 to-transparent" />
      </div>

      <div className="container-page w-full pt-32 pb-24 text-white lg:pt-28">
        <div className="max-w-3xl animate-fade-up">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-mist backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {hero.badge}
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <AccentTitle title={hero.title} accent={hero.titleAccent} />
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.primaryCta.href}
              className="btn-primary bg-white !text-brand-navy hover:bg-brand-paper"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-light"
            >
              <WhatsAppGlyph className="h-5 w-5" />
              {hero.secondaryCta.label}
            </a>
          </div>

          {/* Bullets de confianza */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-white/75">
                <CheckIcon className="h-4 w-4 text-emerald-400" />
                {t}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-bold">{s.value}</dt>
                <dd className="mt-1 text-xs text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Indicador de scroll */}
      <a
        href="#servicio"
        aria-label="Bajar"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition hover:text-white sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </span>
      </a>
    </section>
  );
}

/** Renderiza el título resaltando la palabra `accent` con el color de marca. */
function AccentTitle({ title, accent }: { title: string; accent?: string }) {
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const [before, after] = title.split(accent);
  return (
    <>
      {before}
      <span className="relative whitespace-nowrap text-brand-mist">
        {accent}
        <span className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-emerald-400/80" />
      </span>
      {after}
    </>
  );
}

/** Decoración de fondo: rutas curvas con nodos + pirámide watermark. */
function HeroGraphics() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Pirámide watermark grande */}
      <svg
        className="absolute -right-16 top-1/2 hidden h-[120%] -translate-y-1/2 text-white/[0.04] lg:block"
        viewBox="0 0 80 78"
        fill="none"
        aria-hidden="true"
      >
        <path d="M40 4 L8 70 L72 70 Z" stroke="currentColor" strokeWidth="1" />
        <path d="M40 4 L34 70" stroke="currentColor" strokeWidth="1" />
        <path d="M8 70 L34 70 L48 44 Z" stroke="currentColor" strokeWidth="1" />
        <path d="M48 44 L40 4" stroke="currentColor" strokeWidth="1" />
        <path d="M48 44 L72 70" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Rutas + nodos animados */}
      <svg
        className="absolute inset-0 h-full w-full text-white/15"
        viewBox="0 0 1440 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M-50 620 C 300 520, 520 700, 820 540 S 1300 360, 1500 460"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          className="animate-[dash_22s_linear_infinite]"
        />
        <path
          d="M-50 320 C 240 220, 560 360, 900 240 S 1280 120, 1500 200"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 12"
          opacity="0.6"
        />
        {[
          [300, 545],
          [820, 540],
          [1180, 405],
          [560, 333],
          [900, 240],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="4" fill="currentColor" />
            <circle cx={cx} cy={cy} r="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 6.86 12.4 8.1 8.1 0 0 1-10.3 2.9l-.37-.2-3.08.89.9-3-.24-.39A8.1 8.1 0 0 1 12.04 3.8Zm-3.1 4.3c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.7 4.2 3.68 2.08.82 2.5.66 2.96.62.46-.04 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.48-.73-1.7-.81-.23-.08-.4-.12-.56.12-.16.24-.64.81-.79.97-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.36-.76-1.86-.2-.48-.4-.42-.56-.42Z" />
    </svg>
  );
}
