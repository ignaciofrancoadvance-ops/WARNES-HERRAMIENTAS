import { siteConfig } from "@/lib/site.config";

export function Hero() {
  const { hero, whatsapp } = siteConfig;
  const media = hero.media;

  return (
    <section id="top" className="relative flex min-h-[92vh] items-center overflow-hidden">
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
        {/* Overlay para contraste del texto */}
        <div className="absolute inset-0 bg-brand-navyDark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navyDark via-transparent to-transparent" />
      </div>

      <div className="container-page py-28 text-white">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow text-brand-mist">{hero.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={hero.primaryCta.href} className="btn-primary bg-white !text-brand-navy hover:bg-brand-paper">
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

          {/* Stats */}
          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-bold">{s.value}</dt>
                <dd className="mt-1 text-xs text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 6.86 12.4 8.1 8.1 0 0 1-10.3 2.9l-.37-.2-3.08.89.9-3-.24-.39A8.1 8.1 0 0 1 12.04 3.8Zm-3.1 4.3c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.7 4.2 3.68 2.08.82 2.5.66 2.96.62.46-.04 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.48-.73-1.7-.81-.23-.08-.4-.12-.56.12-.16.24-.64.81-.79.97-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.36-.76-1.86-.2-.48-.4-.42-.56-.42Z" />
    </svg>
  );
}
