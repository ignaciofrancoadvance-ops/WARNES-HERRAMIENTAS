"use client";

import { useCallback, useEffect, useState } from "react";
import { siteConfig, type GalleryItem } from "@/lib/site.config";

export function Gallery() {
  const { gallery } = siteConfig;
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setActive((cur) =>
        cur === null ? cur : (cur + dir + gallery.items.length) % gallery.items.length,
      ),
    [gallery.items.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, go]);

  return (
    <section id="galeria" className="section bg-brand-navy">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-brand-mist">Galería</p>
          <h2 className="section-title mt-3 text-white">{gallery.title}</h2>
          <p className="mt-4 text-lg text-brand-mist">{gallery.subtitle}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-brand-steel to-brand-navyDark focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Thumb item={item} />
              <div className="absolute inset-0 bg-brand-navyDark/0 transition group-hover:bg-brand-navyDark/30" />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg">
                    <PlayIcon className="ml-0.5 h-5 w-5" />
                  </span>
                </span>
              )}
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navyDark/90 to-transparent p-3 text-left text-sm font-medium text-white">
                  {item.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Cerrar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <NavBtn side="left" onClick={() => go(-1)} />
          <NavBtn side="right" onClick={() => go(1)} />

          <figure
            className="max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Lightbox item={gallery.items[active]} />
            {gallery.items[active].caption && (
              <figcaption className="mt-4 text-center text-sm text-white/80">
                {gallery.items[active].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

function Thumb({ item }: { item: GalleryItem }) {
  const src = item.type === "video" ? item.poster ?? "" : item.src;
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={item.alt}
      loading="lazy"
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function Lightbox({ item }: { item: GalleryItem }) {
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        poster={item.poster}
        controls
        autoPlay
        playsInline
        className="max-h-[85vh] w-full rounded-xl bg-black"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={item.alt}
      className="max-h-[85vh] w-full rounded-xl object-contain"
    />
  );
}

function NavBtn({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 ${
        side === "left" ? "left-4" : "right-4"
      } -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20`}
      aria-label={side === "left" ? "Anterior" : "Siguiente"}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {side === "left" ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
