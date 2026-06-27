"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site.config";

export function Faq() {
  const { faq } = siteConfig;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="section-title mt-3">{faq.title}</h2>
          <p className="mt-4 text-lg text-brand-steel">{faq.subtitle}</p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-brand-mist/60 rounded-2xl border border-brand-mist/60">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base font-semibold text-brand-navy">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-mist text-brand-navy transition-transform duration-300 ${
                      isOpen ? "rotate-45 bg-brand-navy text-white" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="px-6 pb-5 text-brand-steel">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
