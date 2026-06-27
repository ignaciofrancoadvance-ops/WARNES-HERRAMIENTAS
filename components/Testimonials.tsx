import { siteConfig } from "@/lib/site.config";

export function Testimonials() {
  const { testimonials } = siteConfig;

  return (
    <section id="testimonios" className="section bg-brand-paper">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Testimonios</p>
          <h2 className="section-title mt-3">{testimonials.title}</h2>
          <p className="mt-4 text-lg text-brand-steel">{testimonials.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.items.map((t) => (
            <figure
              key={t.author}
              className="flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-brand-mist/50"
            >
              <Quote className="h-8 w-8 text-brand-mist" />
              <blockquote className="mt-4 flex-1 text-brand-ink/80">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-brand-mist/50 pt-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy font-display text-sm font-bold text-white">
                  {initials(t.author)}
                </span>
                <span>
                  <span className="block font-semibold text-brand-navy">{t.author}</span>
                  <span className="block text-sm text-brand-steel">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function Quote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c0 2-1.5 3-3 3.5L5 21c3-1 5-3.5 5-7.5V10.5C10 8 9.5 6 7.5 6Zm9 0C14 6 12 8 12 10.5S14 15 16.5 15c0 2-1.5 3-3 3.5l.5 2.5c3-1 5-3.5 5-7.5V10.5C19 8 18.5 6 16.5 6Z" />
    </svg>
  );
}
