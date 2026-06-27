import { siteConfig } from "@/lib/site.config";

/**
 * Logo de Advance Group: pirámide wireframe + wordmark "GROUP".
 * Reconstruido en SVG a partir del manual de marca para que escale nítido.
 * `variant` controla el color del trazo (light = blanco, dark = navy).
 */
export function Logo({
  className = "",
  variant = "dark",
  showWordmark = true,
}: {
  className?: string;
  variant?: "light" | "dark";
  showWordmark?: boolean;
}) {
  const stroke = variant === "light" ? "#FFFFFF" : "#15294B";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label={siteConfig.brand}
    >
      <svg
        viewBox="0 0 80 78"
        className="h-9 w-9 shrink-0"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        {/* triángulo exterior */}
        <path
          d="M40 4 L8 70 L72 70 Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* aristas internas (tetraedro) */}
        <path d="M40 4 L34 70" stroke={stroke} strokeWidth="1.5" />
        <path d="M34 70 L72 70" stroke={stroke} strokeWidth="0" />
        <path d="M8 70 L34 70 L48 44 Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M48 44 L40 4" stroke={stroke} strokeWidth="1.5" />
        <path d="M48 44 L72 70" stroke={stroke} strokeWidth="1.5" />
      </svg>
      {showWordmark && (
        <span
          className="font-display text-sm font-semibold uppercase tracking-[0.35em]"
          style={{ color: stroke }}
        >
          Group
        </span>
      )}
    </span>
  );
}
