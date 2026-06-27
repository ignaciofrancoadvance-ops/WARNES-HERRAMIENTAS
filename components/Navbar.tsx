"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site.config";
import { Logo } from "./Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-brand-navy/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-brand-navy/80"
          : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-20 items-center justify-between">
        <a href="#top" className="flex items-center" aria-label="Inicio">
          <Logo variant="light" />
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a href="#agendar" className="btn-ghost-light">
            Coordinar llamada
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden">
          <div className="space-y-1 bg-brand-navy px-5 pb-6 pt-2">
            {siteConfig.nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#agendar"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 w-full bg-white !text-brand-navy hover:bg-brand-paper"
            >
              Coordinar llamada
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
