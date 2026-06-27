import { siteConfig } from "@/lib/site.config";
import { Logo } from "./Logo";

export function Footer() {
  const { footer, nav, domainEmail, phone, whatsapp } = siteConfig;
  const year = 2026;

  return (
    <footer className="bg-brand-ink text-white">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm text-white/60">{footer.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/70 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <a href={`mailto:${domainEmail}`} className="transition hover:text-white">
                  {domainEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition hover:text-white">
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {siteConfig.brand}. Todos los derechos reservados.
          </p>
          <p>{siteConfig.unit}</p>
        </div>
      </div>
    </footer>
  );
}
