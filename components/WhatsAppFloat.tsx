import { siteConfig } from "@/lib/site.config";

export function WhatsAppFloat() {
  const { whatsapp } = siteConfig;

  return (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-xl shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5d]"
    >
      <span className="flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.18c-.24.68-1.42 1.32-1.95 1.36-.5.04-.96.2-3.24-.7-2.74-1.08-4.46-3.86-4.6-4.04-.13-.18-1.1-1.46-1.1-2.78 0-1.32.69-1.97.94-2.24.25-.27.54-.34.72-.34.18 0 .36 0 .52.01.17.01.39-.06.61.47.24.56.8 1.94.87 2.08.07.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.42.28.14.45.12.61-.07.16-.18.7-.82.89-1.1.18-.28.37-.23.61-.14.25.09 1.57.74 1.84.88.27.14.45.2.52.32.07.12.07.68-.17 1.36Z" />
        </svg>
      </span>
      <span className="hidden text-sm font-semibold sm:block">WhatsApp</span>
    </a>
  );
}
