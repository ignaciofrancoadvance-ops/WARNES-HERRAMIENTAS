"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site.config";

const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

export function CalendlySection() {
  const { agendar, calendly } = siteConfig;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS del widget
    if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }
    // JS del widget (una sola vez)
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_JS}"]`,
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = CALENDLY_JS;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section id="agendar" className="section bg-brand-navyDark">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-brand-mist">Agendá</p>
          <h2 className="section-title mt-3 text-white">{agendar.title}</h2>
          <p className="mt-4 text-lg text-brand-mist">{agendar.subtitle}</p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Widget inline de Calendly */}
          <div
            ref={ref}
            className="calendly-inline-widget"
            data-url={calendly.url}
            style={{ minWidth: "320px", height: "700px" }}
          />
          <noscript>
            <div className="p-8 text-center text-brand-steel">
              Activá JavaScript para ver el calendario, o{" "}
              <a href={calendly.url} className="font-semibold text-brand-navy underline">
                agendá directamente acá
              </a>
              .
            </div>
          </noscript>
        </div>
      </div>
    </section>
  );
}
