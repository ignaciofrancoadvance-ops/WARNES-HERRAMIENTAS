import { siteConfig } from "@/lib/site.config";

export function Service() {
  const { service } = siteConfig;

  return (
    <section id="servicio" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">El servicio</p>
          <h2 className="section-title mt-3">{service.title}</h2>
          <p className="mt-4 text-lg text-brand-steel">{service.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {service.steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-brand-mist/60 bg-brand-paper p-6 transition hover:-translate-y-1 hover:border-brand-steel hover:shadow-xl hover:shadow-brand-navy/5"
            >
              <span className="font-display text-sm font-bold text-brand-slate">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-brand-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-steel">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
